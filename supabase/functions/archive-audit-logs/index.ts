import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurable retention periods (in days)
const RETENTION_PERIOD_DAYS = 90; // Move logs older than 90 days to archive
const ARCHIVE_DELETION_DAYS = 365; // Delete archived logs older than 1 year

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting audit log archival process...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate cutoff dates
    const archiveCutoffDate = new Date();
    archiveCutoffDate.setDate(archiveCutoffDate.getDate() - RETENTION_PERIOD_DAYS);

    const deletionCutoffDate = new Date();
    deletionCutoffDate.setDate(deletionCutoffDate.getDate() - ARCHIVE_DELETION_DAYS);

    console.log(`Archive cutoff date: ${archiveCutoffDate.toISOString()}`);
    console.log(`Deletion cutoff date: ${deletionCutoffDate.toISOString()}`);

    // Step 1: Move old logs to archive
    const { data: logsToArchive, error: fetchError } = await supabase
      .from('audit_logs')
      .select('*')
      .lt('created_at', archiveCutoffDate.toISOString())
      .limit(1000); // Process in batches to avoid timeouts

    if (fetchError) {
      console.error('Error fetching logs to archive:', fetchError);
      throw fetchError;
    }

    let archivedCount = 0;
    if (logsToArchive && logsToArchive.length > 0) {
      console.log(`Found ${logsToArchive.length} logs to archive`);

      // Insert into archive table
      const { error: insertError } = await supabase
        .from('audit_logs_archive')
        .insert(logsToArchive.map(log => ({
          ...log,
          archived_at: new Date().toISOString()
        })));

      if (insertError) {
        console.error('Error inserting into archive:', insertError);
        throw insertError;
      }

      // Delete from main table
      const { error: deleteError } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', archiveCutoffDate.toISOString())
        .limit(1000);

      if (deleteError) {
        console.error('Error deleting archived logs:', deleteError);
        throw deleteError;
      }

      archivedCount = logsToArchive.length;
      console.log(`Successfully archived ${archivedCount} logs`);
    } else {
      console.log('No logs to archive');
    }

    // Step 2: Delete very old archived logs
    const { data: deletedLogs, error: deleteArchiveError } = await supabase
      .from('audit_logs_archive')
      .delete()
      .lt('created_at', deletionCutoffDate.toISOString())
      .select();

    if (deleteArchiveError) {
      console.error('Error deleting old archived logs:', deleteArchiveError);
      throw deleteArchiveError;
    }

    const deletedCount = deletedLogs?.length || 0;
    console.log(`Deleted ${deletedCount} old archived logs`);

    // Step 3: Get statistics
    const { count: activeLogsCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    const { count: archivedLogsCount } = await supabase
      .from('audit_logs_archive')
      .select('*', { count: 'exact', head: true });

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        logsArchived: archivedCount,
        oldLogsDeleted: deletedCount,
        activeLogsCount: activeLogsCount || 0,
        archivedLogsCount: archivedLogsCount || 0
      },
      config: {
        retentionPeriodDays: RETENTION_PERIOD_DAYS,
        archiveDeletionDays: ARCHIVE_DELETION_DAYS
      }
    };

    console.log('Archival process completed:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in archive-audit-logs function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
