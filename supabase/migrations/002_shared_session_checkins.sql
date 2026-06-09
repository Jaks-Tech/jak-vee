alter table public.daily_checkins
  alter column author_id drop not null;

alter table public.daily_checkins
  add column if not exists author_name text not null default 'Jak & Vee',
  add column if not exists prompt_key text,
  add column if not exists is_custom boolean not null default false;

alter table public.daily_checkins
  drop constraint if exists daily_checkins_checkin_type_check;

alter table public.daily_checkins
  add constraint daily_checkins_checkin_type_check
  check (
    checkin_type in (
      'morning',
      'plans',
      'goals',
      'location',
      'meet_time',
      'mood',
      'evening',
      'custom'
    )
  );

create index if not exists daily_checkins_type_created_idx
on public.daily_checkins(checkin_type, created_at desc);
