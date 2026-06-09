alter table public.couple_profiles
  add column if not exists mention_handles text[] not null default '{}',
  add column if not exists discord_user_id text,
  add column if not exists discord_mentions_enabled boolean not null default true;

update public.couple_profiles
set mention_handles = array['jak']
where person_name = 'Jak'
  and cardinality(mention_handles) = 0;

update public.couple_profiles
set mention_handles = array['vee']
where person_name = 'Vee'
  and cardinality(mention_handles) = 0;
