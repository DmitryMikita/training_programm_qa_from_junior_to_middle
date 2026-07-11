-- One current summary per training program.
alter table public.ri_summary
  rename column updtated_at to updated_at;

alter table public.ri_summary
  alter column content set default '',
  alter column status set default 0;

alter table public.ri_summary
  add constraint ri_summary_programm_id_key unique (programm_id);

comment on column public.ri_summary.status is
  '0=pending, 1=generating, 2=ready, 3=failed, 4=manual';

alter table public.ri_summary enable row level security;

grant select on public.ri_summary to anon;

create policy "Public read ready summaries"
on public.ri_summary
for select
to anon
using (status in (2, 4));
