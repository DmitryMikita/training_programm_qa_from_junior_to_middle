import { createClient } from 'npm:@supabase/supabase-js@2';

const SUMMARY_STATUS = Object.freeze({
  PENDING: 0,
  GENERATING: 1,
  READY: 2,
  FAILED: 3,
  MANUAL: 4,
});

type ProgramRecord = {
  id: number;
  title: string;
  description: string | null;
  program: unknown;
};

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: ProgramRecord | null;
  old_record: ProgramRecord | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,x-webhook-secret',
};

function sourceChanged(payload: WebhookPayload) {
  if (payload.type === 'INSERT') return true;
  if (payload.type !== 'UPDATE' || !payload.record || !payload.old_record) return false;

  return payload.record.title !== payload.old_record.title
    || payload.record.description !== payload.old_record.description
    || JSON.stringify(payload.record.program) !== JSON.stringify(payload.old_record.program);
}

async function generateSummary(program: ProgramRecord) {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  const model = Deno.env.get('GROQ_MODEL') ?? 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY secret is required');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_completion_tokens: 100,
      messages: [
        {
          role: 'system',
          content: 'Создай грамотное краткое саммари учебного модуля на русском языке для карточки сайта. Один абзац, 1–2 предложения, до 180 символов. Пиши от третьего лица, без обращения к читателю, заголовка и markdown. Верни только готовое саммари.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: program.title,
            description: program.description,
            program: program.program,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider returned ${response.status}: ${await response.text()}`);
  }

  const body = await response.json();
  const content = body.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('AI provider returned an empty summary');
  return content.length <= 180 ? content : `${content.slice(0, 179).trimEnd()}…`;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
  if (!expectedSecret || request.headers.get('x-webhook-secret') !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json() as WebhookPayload;
  if (payload.schema !== 'public' || payload.table !== 'ri_programm' || !payload.record) {
    return Response.json({ skipped: true, reason: 'Unsupported webhook payload' });
  }
  if (!sourceChanged(payload)) {
    return Response.json({ skipped: true, reason: 'Summary source did not change' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const programmId = payload.record.id;

  const { data: current } = await supabase
    .from('ri_summary')
    .select('status')
    .eq('programm_id', programmId)
    .maybeSingle();

  if (current?.status === SUMMARY_STATUS.MANUAL) {
    return Response.json({ skipped: true, reason: 'Manual summary is protected' });
  }

  await supabase.from('ri_summary').upsert({
    programm_id: programmId,
    status: SUMMARY_STATUS.GENERATING,
    content: '',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'programm_id' });

  try {
    const content = await generateSummary(payload.record);
    const { error } = await supabase.from('ri_summary').upsert({
      programm_id: programmId,
      status: SUMMARY_STATUS.READY,
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'programm_id' });
    if (error) throw error;
    return Response.json({ programmId, status: 'ready', content });
  } catch (error) {
    await supabase.from('ri_summary').upsert({
      programm_id: programmId,
      status: SUMMARY_STATUS.FAILED,
      content: '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'programm_id' });
    console.error(error);
    return Response.json({ programmId, status: 'failed' }, { status: 502 });
  }
});
