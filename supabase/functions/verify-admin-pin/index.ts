import { corsHeaders, isValidAdminPin, jsonResponse } from '../_shared/admin.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { pin } = await request.json();
    return jsonResponse({ valid: await isValidAdminPin(pin) });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Не удалось проверить код' }, 500);
  }
});
