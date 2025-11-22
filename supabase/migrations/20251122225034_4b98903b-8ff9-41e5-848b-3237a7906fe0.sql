-- Create archive table for old audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs_archive (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for archive table
CREATE INDEX idx_audit_logs_archive_user_id ON public.audit_logs_archive(user_id);
CREATE INDEX idx_audit_logs_archive_created_at ON public.audit_logs_archive(created_at DESC);
CREATE INDEX idx_audit_logs_archive_archived_at ON public.audit_logs_archive(archived_at DESC);

-- Enable RLS on archive table
ALTER TABLE public.audit_logs_archive ENABLE ROW LEVEL SECURITY;

-- Users can view their own archived logs
CREATE POLICY "Users can view own archived logs"
ON public.audit_logs_archive
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage archived logs
CREATE POLICY "Service role can manage archived logs"
ON public.audit_logs_archive
FOR ALL
USING (true);

-- Add comments
COMMENT ON TABLE public.audit_logs_archive IS 'Archived audit logs older than retention period';
COMMENT ON COLUMN public.audit_logs_archive.archived_at IS 'Timestamp when the log was moved to archive';

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;