import { createClient } from 'npm:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

export async function isValidAdminPin(pin: unknown) {
  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) return false;

  const { data, error } = await getAdminClient()
    .from('di_settings')
    .select('value')
    .eq('name', 'PIN_CODE')
    .maybeSingle();

  if (error) throw error;
  return data?.value === pin;
}

export function adminClient() {
  return getAdminClient();
}
