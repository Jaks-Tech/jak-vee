alter table public.memories
  alter column author_id drop not null;

alter table public.memories
  add column if not exists author_name text not null default 'Jak & Vee',
  add column if not exists memory_type text not null default 'memory',
  add column if not exists is_favorite boolean not null default false;

alter table public.memories
  drop constraint if exists memories_memory_type_check;

alter table public.memories
  add constraint memories_memory_type_check
  check (
    memory_type in (
      'text',
      'photo',
      'video',
      'memory',
      'moment',
      'date',
      'trip',
      'gift',
      'place',
      'letter',
      'song',
      'anniversary',
      'surprise'
    )
  );

alter table public.memory_media
  alter column uploader_id drop not null;

alter table public.memory_media
  add column if not exists uploader_name text not null default 'Jak & Vee',
  add column if not exists file_name text,
  add column if not exists content_type text,
  add column if not exists file_size bigint;

alter table public.memories replica identity full;
alter table public.memory_media replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.memories;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.memory_media;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
