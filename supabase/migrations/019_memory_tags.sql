alter table public.memories
  add column if not exists tags text[] not null default '{}';

create index if not exists memories_tags_idx
on public.memories using gin(tags);
