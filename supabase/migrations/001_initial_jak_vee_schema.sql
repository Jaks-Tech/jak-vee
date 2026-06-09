create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  handle text unique,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  checkin_type text not null check (
    checkin_type in ('morning', 'plans', 'goals', 'location', 'meet_time', 'mood', 'evening')
  ),
  title text not null,
  body text,
  mood text,
  location_label text,
  meet_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.love_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  note_type text not null default 'note' check (note_type in ('note', 'letter', 'morning', 'surprise')),
  scheduled_for timestamptz,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  memory_date date,
  location_text text,
  cover_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  bucket_id text not null default 'memories-media',
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video', 'file')),
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.shared_links (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  link_type text not null default 'link' check (link_type in ('song', 'video', 'place', 'link')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date_value date not null,
  reminder_rule text not null default 'yearly' check (reminder_rule in ('once', 'monthly', 'yearly')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_chapters (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  chapter_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text,
  attachment_bucket text,
  attachment_path text,
  attachment_type text check (attachment_type in ('image', 'video', 'file', 'audio')),
  reply_to_id uuid references public.chat_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_message_has_content check (
    body is not null or attachment_path is not null
  )
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (
    target_type in (
      'daily_checkin',
      'love_note',
      'memory',
      'memory_media',
      'shared_link',
      'anniversary',
      'story_chapter',
      'chat_message'
    )
  ),
  target_id uuid not null,
  body text,
  attachment_bucket text,
  attachment_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comment_has_content check (
    body is not null or attachment_path is not null
  )
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
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
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (author_id, target_type, target_id, emoji)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_checkins_updated_at on public.daily_checkins;
create trigger set_daily_checkins_updated_at
before update on public.daily_checkins
for each row execute function public.set_updated_at();

drop trigger if exists set_love_notes_updated_at on public.love_notes;
create trigger set_love_notes_updated_at
before update on public.love_notes
for each row execute function public.set_updated_at();

drop trigger if exists set_memories_updated_at on public.memories;
create trigger set_memories_updated_at
before update on public.memories
for each row execute function public.set_updated_at();

drop trigger if exists set_shared_links_updated_at on public.shared_links;
create trigger set_shared_links_updated_at
before update on public.shared_links
for each row execute function public.set_updated_at();

drop trigger if exists set_anniversaries_updated_at on public.anniversaries;
create trigger set_anniversaries_updated_at
before update on public.anniversaries
for each row execute function public.set_updated_at();

drop trigger if exists set_story_chapters_updated_at on public.story_chapters;
create trigger set_story_chapters_updated_at
before update on public.story_chapters
for each row execute function public.set_updated_at();

drop trigger if exists set_chat_messages_updated_at on public.chat_messages;
create trigger set_chat_messages_updated_at
before update on public.chat_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create index if not exists daily_checkins_author_created_idx on public.daily_checkins(author_id, created_at desc);
create index if not exists love_notes_author_created_idx on public.love_notes(author_id, created_at desc);
create index if not exists memories_author_created_idx on public.memories(author_id, created_at desc);
create index if not exists memory_media_memory_idx on public.memory_media(memory_id, sort_order);
create index if not exists shared_links_author_created_idx on public.shared_links(author_id, created_at desc);
create index if not exists anniversaries_date_idx on public.anniversaries(date_value);
create index if not exists story_chapters_sort_idx on public.story_chapters(sort_order, created_at);
create index if not exists chat_messages_created_idx on public.chat_messages(created_at desc);
create index if not exists comments_target_idx on public.comments(target_type, target_id, created_at);
create index if not exists reactions_target_idx on public.reactions(target_type, target_id);

alter table public.profiles enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.love_notes enable row level security;
alter table public.memories enable row level security;
alter table public.memory_media enable row level security;
alter table public.shared_links enable row level security;
alter table public.anniversaries enable row level security;
alter table public.story_chapters enable row level security;
alter table public.chat_messages enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "daily_checkins_all_authenticated" on public.daily_checkins;
create policy "daily_checkins_all_authenticated"
on public.daily_checkins for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "love_notes_all_authenticated" on public.love_notes;
create policy "love_notes_all_authenticated"
on public.love_notes for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "memories_all_authenticated" on public.memories;
create policy "memories_all_authenticated"
on public.memories for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "memory_media_all_authenticated" on public.memory_media;
create policy "memory_media_all_authenticated"
on public.memory_media for all
to authenticated
using (true)
with check (uploader_id = auth.uid());

drop policy if exists "shared_links_all_authenticated" on public.shared_links;
create policy "shared_links_all_authenticated"
on public.shared_links for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "anniversaries_all_authenticated" on public.anniversaries;
create policy "anniversaries_all_authenticated"
on public.anniversaries for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "story_chapters_all_authenticated" on public.story_chapters;
create policy "story_chapters_all_authenticated"
on public.story_chapters for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "chat_messages_all_authenticated" on public.chat_messages;
create policy "chat_messages_all_authenticated"
on public.chat_messages for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "comments_all_authenticated" on public.comments;
create policy "comments_all_authenticated"
on public.comments for all
to authenticated
using (true)
with check (author_id = auth.uid());

drop policy if exists "reactions_all_authenticated" on public.reactions;
create policy "reactions_all_authenticated"
on public.reactions for all
to authenticated
using (true)
with check (author_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'memories-media',
    'memories-media',
    false,
    104857600,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  ),
  (
    'chat-attachments',
    'chat-attachments',
    false,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'application/pdf']
  ),
  (
    'note-attachments',
    'note-attachments',
    false,
    20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "couple_storage_select_authenticated" on storage.objects;
create policy "couple_storage_select_authenticated"
on storage.objects for select
to authenticated
using (bucket_id in ('avatars', 'memories-media', 'chat-attachments', 'note-attachments'));

drop policy if exists "couple_storage_insert_authenticated" on storage.objects;
create policy "couple_storage_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id in ('avatars', 'memories-media', 'chat-attachments', 'note-attachments'));

drop policy if exists "couple_storage_update_authenticated" on storage.objects;
create policy "couple_storage_update_authenticated"
on storage.objects for update
to authenticated
using (bucket_id in ('avatars', 'memories-media', 'chat-attachments', 'note-attachments'))
with check (bucket_id in ('avatars', 'memories-media', 'chat-attachments', 'note-attachments'));

drop policy if exists "couple_storage_delete_authenticated" on storage.objects;
create policy "couple_storage_delete_authenticated"
on storage.objects for delete
to authenticated
using (bucket_id in ('avatars', 'memories-media', 'chat-attachments', 'note-attachments'));
