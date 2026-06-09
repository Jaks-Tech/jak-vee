alter table public.shared_links
  alter column author_id drop not null,
  alter column url drop not null;

alter table public.shared_links
  add column if not exists author_name text not null default 'Jak & Vee',
  add column if not exists source_title text,
  add column if not exists is_favorite boolean not null default false;

alter table public.shared_links
  drop constraint if exists shared_links_link_type_check;

alter table public.shared_links
  alter column link_type set default 'Link';

create index if not exists shared_links_type_created_idx
on public.shared_links(link_type, created_at desc);

create index if not exists shared_links_author_name_created_idx
on public.shared_links(author_name, created_at desc);

alter table public.shared_links replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.shared_links;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
