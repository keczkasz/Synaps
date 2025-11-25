import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ChatGPT GPT OAuth Token endpoint
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse request body - ChatGPT sends form-urlencoded data
    let grantType: string | null = null;
    let clientId: string | null = null;
    let clientSecret: string | null = null;
    let authCode: string | null = null;
    let redirectUri: string | null = null;
    let inputRefreshToken: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      grantType = formData.get('grant_type') as string;
      clientId = formData.get('client_id') as string;
      clientSecret = formData.get('client_secret') as string;
      authCode = formData.get('code') as string;
      redirectUri = formData.get('redirect_uri') as string;
      inputRefreshToken = formData.get('refresh_token') as string;
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      grantType = body.grant_type;
      clientId = body.client_id;
      clientSecret = body.client_secret;
      authCode = body.code;
      redirectUri = body.redirect_uri;
      inputRefreshToken = body.refresh_token;
    } else {
      // Try form data as fallback
      try {
        const formData = await req.formData();
        grantType = formData.get('grant_type') as string;
        clientId = formData.get('client_id') as string;
        clientSecret = formData.get('client_secret') as string;
        authCode = formData.get('code') as string;
        redirectUri = formData.get('redirect_uri') as string;
        inputRefreshToken = formData.get('refresh_token') as string;
      } catch {
        return new Response(JSON.stringify({ 
          error: 'invalid_request',
          error_description: 'Unable to parse request body'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('OAuth token request:', { 
      grantType, 
      clientId, 
      hasSecret: !!clientSecret, 
      hasCode: !!authCode,
      hasRefreshToken: !!inputRefreshToken 
    });

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ 
        error: 'invalid_request',
        error_description: 'Missing client credentials'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify client credentials
    const { data: client, error: clientError } = await supabase
      .from('gpt_oauth_clients')
      .select('*')
      .eq('client_id', clientId)
      .eq('client_secret', clientSecret)
      .single();

    if (clientError || !client) {
      console.error('Invalid client credentials:', clientId, clientError);
      return new Response(JSON.stringify({ 
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle authorization_code grant
    if (grantType === 'authorization_code') {
      if (!authCode) {
        return new Response(JSON.stringify({ 
          error: 'invalid_request',
          error_description: 'Missing authorization code'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify authorization code
      const { data: codeData, error: codeError } = await supabase
        .from('gpt_oauth_codes')
        .select('*')
        .eq('code', authCode)
        .eq('client_id', clientId)
        .eq('used', false)
        .single();

      if (codeError || !codeData) {
        console.error('Invalid authorization code:', authCode, codeError);
        return new Response(JSON.stringify({ 
          error: 'invalid_grant',
          error_description: 'Invalid or expired authorization code'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if code is expired
      if (new Date(codeData.expires_at) < new Date()) {
        console.error('Authorization code expired:', authCode);
        return new Response(JSON.stringify({ 
          error: 'invalid_grant',
          error_description: 'Authorization code expired'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify redirect URI matches (if provided)
      if (redirectUri && codeData.redirect_uri !== redirectUri) {
        console.error('Redirect URI mismatch:', redirectUri, 'vs', codeData.redirect_uri);
        return new Response(JSON.stringify({ 
          error: 'invalid_grant',
          error_description: 'Redirect URI mismatch'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mark code as used
      await supabase
        .from('gpt_oauth_codes')
        .update({ used: true })
        .eq('code', authCode);

      // Generate tokens
      const accessToken = crypto.randomUUID();
      const newRefreshToken = crypto.randomUUID();
      const expiresIn = 3600; // 1 hour
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      const { error: tokenError } = await supabase
        .from('gpt_oauth_tokens')
        .insert({
          access_token: accessToken,
          refresh_token: newRefreshToken,
          client_id: clientId,
          user_id: codeData.user_id,
          scope: codeData.scope,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) {
        console.error('Error creating tokens:', tokenError);
        return new Response(JSON.stringify({ 
          error: 'server_error',
          error_description: 'Failed to create tokens'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Successfully issued tokens for user:', codeData.user_id);

      return new Response(JSON.stringify({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: codeData.scope
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle refresh_token grant
    if (grantType === 'refresh_token') {
      if (!inputRefreshToken) {
        return new Response(JSON.stringify({ 
          error: 'invalid_request',
          error_description: 'Missing refresh token'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: tokenData, error: tokenError } = await supabase
        .from('gpt_oauth_tokens')
        .select('*')
        .eq('refresh_token', inputRefreshToken)
        .eq('client_id', clientId)
        .eq('revoked', false)
        .single();

      if (tokenError || !tokenData) {
        console.error('Invalid refresh token:', inputRefreshToken, tokenError);
        return new Response(JSON.stringify({ 
          error: 'invalid_grant',
          error_description: 'Invalid refresh token'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate new access token
      const newAccessToken = crypto.randomUUID();
      const expiresIn = 3600; // 1 hour
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      await supabase
        .from('gpt_oauth_tokens')
        .update({
          access_token: newAccessToken,
          expires_at: expiresAt.toISOString()
        })
        .eq('refresh_token', inputRefreshToken);

      console.log('Successfully refreshed token for user:', tokenData.user_id);

      return new Response(JSON.stringify({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: inputRefreshToken,
        scope: tokenData.scope
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'unsupported_grant_type',
      error_description: `Grant type '${grantType}' not supported`
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in oauth-token:', error);
    return new Response(JSON.stringify({ 
      error: 'server_error',
      error_description: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
