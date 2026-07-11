create table if not exists public.di_settings (
  name text primary key,
  value text not null
);

alter table public.di_settings enable row level security;
revoke all on public.di_settings from anon, authenticated;

create or replace function public.create_program_with_homework(
  p_title text,
  p_description text,
  p_program jsonb,
  p_homework text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_programm_id bigint;
begin
  if nullif(btrim(p_title), '') is null then
    raise exception 'Название модуля обязательно';
  end if;
  if nullif(btrim(p_description), '') is null then
    raise exception 'Краткое описание обязательно';
  end if;
  if jsonb_typeof(p_program) <> 'array' or jsonb_array_length(p_program) = 0 then
    raise exception 'Добавьте хотя бы один пункт программы';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_program) item
    where nullif(btrim(item->>'title'), '') is null
  ) then
    raise exception 'Пункты программы не могут быть пустыми';
  end if;

  insert into public.ri_programm (title, status, score, description, program)
  values (btrim(p_title), 0, null, btrim(p_description), p_program)
  returning id into new_programm_id;

  if nullif(btrim(coalesce(p_homework, '')), '') is not null then
    insert into public.ri_homework (program_id, homework)
    values (new_programm_id, btrim(p_homework));
  end if;

  return new_programm_id;
end;
$$;

revoke all on function public.create_program_with_homework(text, text, jsonb, text)
from public, anon, authenticated;
grant execute on function public.create_program_with_homework(text, text, jsonb, text)
to service_role;
