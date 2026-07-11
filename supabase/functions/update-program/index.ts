import { adminClient, corsHeaders, isValidAdminPin, jsonResponse } from '../_shared/admin.ts';
type ProgramItem = { title?: unknown };
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  try {
    const body = await request.json();
    if (!await isValidAdminPin(body.pin)) return jsonResponse({ error: 'Неверный код' }, 403);
    const id=Number(body.id), status=Number(body.status);
    const title=typeof body.title==='string'?body.title.trim():'';
    const description=typeof body.description==='string'?body.description.trim():'';
    const homework=typeof body.homework==='string'?body.homework.trim():'';
    const program=Array.isArray(body.program)?body.program.map((item:ProgramItem)=>({title:typeof item?.title==='string'?item.title.trim():''})):[];
    if (!Number.isSafeInteger(id)||id<=0) return jsonResponse({error:'Некорректный идентификатор модуля'},400);
    if (!title) return jsonResponse({error:'Заполните название модуля'},400);
    if (!description) return jsonResponse({error:'Заполните краткое описание'},400);
    if (!Number.isInteger(status)||status<0||status>3) return jsonResponse({error:'Выберите корректный статус'},400);
    if (!program.length||program.some(item=>!item.title)) return jsonResponse({error:'Заполните все пункты программы'},400);
    const {data,error}=await adminClient().rpc('update_program_with_homework',{p_programm_id:id,p_title:title,p_description:description,p_status:status,p_program:program,p_homework:homework||null});
    if(error) throw error;
    return jsonResponse({id:data,message:'Изменения успешно сохранены'});
  } catch(error) {
    console.error(error);
    return jsonResponse({error:'Не удалось сохранить модуль. Попробуйте ещё раз.'},500);
  }
});
