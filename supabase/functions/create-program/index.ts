import { adminClient, corsHeaders, isValidAdminPin, jsonResponse } from '../_shared/admin.ts';

type ProgramItem = { title?: unknown };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const body = await request.json();
    if (!await isValidAdminPin(body.pin)) return jsonResponse({ error: 'Неверный код' }, 403);

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const homework = typeof body.homework === 'string' ? body.homework.trim() : '';
    const program = Array.isArray(body.program)
      ? body.program.map((item: ProgramItem) => ({
        title: typeof item?.title === 'string' ? item.title.trim() : '',
      }))
      : [];

    if (!title) return jsonResponse({ error: 'Заполните название модуля' }, 400);
    if (!description) return jsonResponse({ error: 'Заполните краткое описание' }, 400);
    if (program.length === 0 || program.some((item) => !item.title)) {
      return jsonResponse({ error: 'Заполните все пункты программы' }, 400);
    }

    const { data, error } = await adminClient().rpc('create_program_with_homework', {
      p_title: title,
      p_description: description,
      p_program: program,
      p_homework: homework || null,
    });

    if (error) throw error;
    return jsonResponse({ id: data, message: 'Модуль успешно добавлен' }, 201);
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Не удалось добавить модуль. Попробуйте ещё раз.' }, 500);
  }
});
