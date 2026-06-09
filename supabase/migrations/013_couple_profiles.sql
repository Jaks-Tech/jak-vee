create table if not exists public.couple_profiles (
  person_name text primary key check (person_name in ('Jak', 'Vee')),
  display_name text not null,
  avatar_bucket text not null default 'avatars',
  avatar_path text,
  bio text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.couple_profiles (person_name, display_name)
values ('Jak', 'Jak'), ('Vee', 'Vee')
on conflict (person_name) do nothing;

drop trigger if exists set_couple_profiles_updated_at on public.couple_profiles;
create trigger set_couple_profiles_updated_at
before update on public.couple_profiles
for each row execute function public.set_updated_at();

alter table public.couple_profiles enable row level security;

drop policy if exists "couple_profiles_all_authenticated" on public.couple_profiles;
create policy "couple_profiles_all_authenticated"
on public.couple_profiles for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

alter table public.couple_profiles replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.couple_profiles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
