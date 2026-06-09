alter table public.story_chapters
  alter column author_id drop not null;

alter table public.story_chapters
  add column if not exists author_name text not null default 'Jak & Vee',
  add column if not exists chapter_type text not null default 'Chapter',
  add column if not exists mood text,
  add column if not exists is_favorite boolean not null default false;

create index if not exists story_chapters_type_date_idx
on public.story_chapters(chapter_type, chapter_date desc);

create index if not exists story_chapters_author_name_created_idx
on public.story_chapters(author_name, created_at desc);

alter table public.story_chapters replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.story_chapters;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
