create table if not exists public.activity_events (
  id bigserial primary key,
  table_name text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  row_id text,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_created_idx
on public.activity_events(created_at desc);

create or replace function public.log_activity_event()
returns trigger
language plpgsql
security definer
as $$
declare
  changed_id text;
begin
  if tg_op = 'DELETE' then
    changed_id := old.id::text;
  elsif tg_table_name = 'couple_profiles' then
    changed_id := new.person_name::text;
  else
    changed_id := new.id::text;
  end if;

  insert into public.activity_events (table_name, action, row_id)
  values (tg_table_name, tg_op, changed_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

do $$
declare
  tracked_table text;
begin
  foreach tracked_table in array array[
    'daily_checkins',
    'love_notes',
    'memories',
    'memory_media',
    'shared_links',
    'anniversaries',
    'story_chapters',
    'chat_messages',
    'couple_profiles',
    'comments'
  ]
  loop
    execute format('drop trigger if exists log_activity_%I on public.%I', tracked_table, tracked_table);
    execute format(
      'create trigger log_activity_%I after insert or update or delete on public.%I for each row execute function public.log_activity_event()',
      tracked_table,
      tracked_table
    );
  end loop;
end;
$$;

alter table public.activity_events enable row level security;

drop policy if exists "activity_events_all_authenticated" on public.activity_events;
create policy "activity_events_all_authenticated"
on public.activity_events for select
using (auth.role() = 'authenticated');

alter table public.activity_events replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.activity_events;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
