create unique index if not exists ri_homework_program_id_key on public.ri_homework (program_id);

create or replace function public.update_program_with_homework(p_programm_id bigint, p_title text, p_description text, p_status smallint, p_program jsonb, p_homework text default null)
returns bigint language plpgsql security definer set search_path = '' as $$
begin
  if p_programm_id is null or p_programm_id <= 0 then raise exception 'Некорректный идентификатор модуля'; end if;
  if nullif(btrim(p_title), '') is null then raise exception 'Название модуля обязательно'; end if;
  if nullif(btrim(p_description), '') is null then raise exception 'Краткое описание обязательно'; end if;
  if p_status is null or p_status not between 0 and 3 then raise exception 'Некорректный статус'; end if;
  if jsonb_typeof(p_program) <> 'array' or jsonb_array_length(p_program) = 0 then raise exception 'Добавьте хотя бы один пункт программы'; end if;
  if exists (select 1 from jsonb_array_elements(p_program) item where nullif(btrim(item->>'title'), '') is null) then raise exception 'Пункты программы не могут быть пустыми'; end if;
  update public.ri_programm set title=btrim(p_title), description=btrim(p_description), status=p_status, program=p_program where id=p_programm_id;
  if not found then raise exception 'Модуль не найден'; end if;
  if nullif(btrim(coalesce(p_homework, '')), '') is null then
    delete from public.ri_homework where program_id=p_programm_id;
  else
    insert into public.ri_homework(program_id, homework) values(p_programm_id, btrim(p_homework)) on conflict(program_id) do update set homework=excluded.homework;
  end if;
  return p_programm_id;
end; $$;
revoke all on function public.update_program_with_homework(bigint,text,text,smallint,jsonb,text) from public, anon, authenticated;
grant execute on function public.update_program_with_homework(bigint,text,text,smallint,jsonb,text) to service_role;
