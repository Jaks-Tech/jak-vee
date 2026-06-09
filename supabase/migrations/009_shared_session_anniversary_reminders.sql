alter table public.anniversaries
  alter column author_id drop not null;

alter table public.anniversaries
  add column if not exists author_name text not null default 'Jak & Vee',
  add column if not exists event_type text not null default 'anniversary',
  add column if not exists event_time time not null default '09:00',
  add column if not exists timezone text not null default 'Africa/Nairobi',
  add column if not exists email_enabled boolean not null default false,
  add column if not exists email_recipients text[] not null default '{}',
  add column if not exists email_subject text,
  add column if not exists email_message text,
  add column if not exists last_email_sent_at timestamptz,
  add column if not exists last_email_occurrence_key text;

alter table public.anniversaries
  drop constraint if exists anniversaries_reminder_rule_check;

alter table public.anniversaries
  add constraint anniversaries_reminder_rule_check
  check (reminder_rule in ('once', 'monthly', 'yearly'));

create index if not exists anniversaries_event_type_date_idx
on public.anniversaries(event_type, date_value);

create index if not exists anniversaries_email_enabled_idx
on public.anniversaries(email_enabled, date_value);

alter table public.anniversaries replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.anniversaries;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
