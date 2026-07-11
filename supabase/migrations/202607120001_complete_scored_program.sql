create or replace function public.set_program_score_once(p_programm_id bigint, p_score numeric)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_programm_id is null or p_programm_id <= 0 then raise exception 'Некорректный идентификатор модуля'; end if;
  if p_score is null or p_score < 1 or p_score > 5 or p_score * 10 <> trunc(p_score * 10) then
    raise exception 'Оценка должна быть от 1 до 5 с точностью до одного знака после запятой';
  end if;
  update public.ri_programm
  set score = p_score, status = 3
  where id = p_programm_id and score is null;
  if found then return p_score; end if;
  if not exists (select 1 from public.ri_programm where id = p_programm_id) then raise exception 'Модуль не найден'; end if;
  raise exception 'Оценка уже выставлена';
end;
$$;

revoke all on function public.set_program_score_once(bigint, numeric) from public, anon, authenticated;
grant execute on function public.set_program_score_once(bigint, numeric) to service_role;
