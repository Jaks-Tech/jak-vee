alter table public.comments
  alter column author_id drop not null;

alter table public.comments
  add column if not exists author_name text not null default 'Jak & Vee';

alter table public.reactions
  alter column author_id drop not null;

alter table public.reactions
  add column if not exists author_name text not null default 'Jak & Vee';

alter table public.reactions
  drop constraint if exists reactions_author_id_target_type_target_id_emoji_key;

drop index if exists reactions_author_id_target_type_target_id_emoji_key;

create unique index if not exists reactions_author_name_target_type_target_id_emoji_key
on public.reactions(author_name, target_type, target_id, emoji);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Jak & Vee',
  target_type text not null check (
    target_type in (
      'daily_checkin',
      'love_note',
      'memory',
      'memory_media',
      'shared_link',
      'anniversary',
      'story_chapter',
      'chat_message',
      'comment'
    )
  ),
  target_id uuid not null,
  share_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_target_created_idx
on public.comments(target_type, target_id, created_at asc);

create index if not exists reactions_target_idx
on public.reactions(target_type, target_id, emoji);

create index if not exists shares_target_idx
on public.shares(target_type, target_id, created_at desc);

alter table public.shares enable row level security;

drop policy if exists "shares_all_authenticated" on public.shares;
create policy "shares_all_authenticated"
on public.shares for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

alter table public.comments replica identity full;
alter table public.reactions replica identity full;
alter table public.shares replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.reactions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.shares;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
