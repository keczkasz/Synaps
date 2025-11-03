import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function verifyOAuthToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'unauthorized', status: 401, userId: null };
  }

  const token = authHeader.substring(7);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const { data: tokenData, error } = await supabase
    .from('gpt_oauth_tokens')
    .select('*')
    .eq('access_token', token)
    .eq('revoked', false)
    .single();

  if (error || !tokenData) {
    return { error: 'invalid_token', status: 401, userId: null };
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { error: 'token_expired', status: 401, userId: null };
  }

  return { error: null, status: 200, userId: tokenData.user_id };
}

export async function logApiCall(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  requestBody?: any,
  responseBody?: any,
  errorMessage?: string
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  await supabase.from('gpt_api_logs').insert({
    user_id: userId,
    endpoint,
    method,
    status_code: statusCode,
    request_body: requestBody,
    response_body: responseBody,
    error_message: errorMessage
  });
}
