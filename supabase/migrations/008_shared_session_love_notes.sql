alter table public.love_notes
  alter column author_id drop not null;

alter table public.love_notes
  add column if not exists author_name text not null default 'Jak & Vee';

alter table public.love_notes
  drop constraint if exists love_notes_note_type_check;

alter table public.love_notes
  alter column note_type set default 'Private note';

create index if not exists love_notes_type_created_idx
on public.love_notes(note_type, created_at desc);

create index if not exists love_notes_author_name_created_idx
on public.love_notes(author_name, created_at desc);

alter table public.love_notes replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.love_notes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
