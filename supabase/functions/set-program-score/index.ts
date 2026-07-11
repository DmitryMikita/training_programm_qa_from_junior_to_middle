import { adminClient, corsHeaders, isValidAdminPin, jsonResponse } from '../_shared/admin.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  try {
    const body = await request.json();
    if (!await isValidAdminPin(body.pin)) return jsonResponse({ error: 'Неверный код' }, 403);
    const id = Number(body.id);
    const score = Number(body.score);
    if (!Number.isSafeInteger(id) || id <= 0) return jsonResponse({ error: 'Некорректный идентификатор модуля' }, 400);
    if (!Number.isFinite(score) || score < 1 || score > 5 || !Number.isInteger(score * 10)) {
      return jsonResponse({ error: 'Введите оценку от 1 до 5 с точностью до одного знака после запятой' }, 400);
    }
    const { data, error } = await adminClient().rpc('set_program_score_once', { p_programm_id: id, p_score: score });
    if (error) {
      if (error.message.includes('Оценка уже выставлена')) return jsonResponse({ error: 'Оценка уже выставлена' }, 409);
      if (error.message.includes('Модуль не найден')) return jsonResponse({ error: 'Модуль не найден' }, 404);
      throw error;
    }
    return jsonResponse({ id, score: data, message: 'Оценка успешно сохранена' });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Не удалось сохранить оценку. Попробуйте ещё раз.' }, 500);
  }
});
