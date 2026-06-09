create table if not exists public.ai_daily_summaries (
  id uuid primary key default gen_random_uuid(),
  summary_date date not null unique,
  summary text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists ai_daily_summaries_expires_idx
on public.ai_daily_summaries(expires_at);

alter table public.ai_daily_summaries enable row level security;

drop policy if exists "ai_daily_summaries_all_authenticated" on public.ai_daily_summaries;
create policy "ai_daily_summaries_all_authenticated"
on public.ai_daily_summaries for select
using (auth.role() = 'authenticated');

alter table public.ai_daily_summaries replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.ai_daily_summaries;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
