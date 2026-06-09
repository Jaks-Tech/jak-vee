alter table public.memories
  add column if not exists is_private boolean not null default false;

create index if not exists memories_private_created_idx
on public.memories(is_private, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-memories-media',
  'private-memories-media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "couple_storage_select_authenticated" on storage.objects;
create policy "couple_storage_select_authenticated"
on storage.objects for select
to authenticated
using (bucket_id in ('avatars', 'memories-media', 'private-memories-media', 'chat-attachments', 'note-attachments'));

drop policy if exists "couple_storage_insert_authenticated" on storage.objects;
create policy "couple_storage_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id in ('avatars', 'memories-media', 'private-memories-media', 'chat-attachments', 'note-attachments'));

drop policy if exists "couple_storage_update_authenticated" on storage.objects;
create policy "couple_storage_update_authenticated"
on storage.objects for update
to authenticated
using (bucket_id in ('avatars', 'memories-media', 'private-memories-media', 'chat-attachments', 'note-attachments'))
with check (bucket_id in ('avatars', 'memories-media', 'private-memories-media', 'chat-attachments', 'note-attachments'));

drop policy if exists "couple_storage_delete_authenticated" on storage.objects;
create policy "couple_storage_delete_authenticated"
on storage.objects for delete
to authenticated
using (bucket_id in ('avatars', 'memories-media', 'private-memories-media', 'chat-attachments', 'note-attachments'));
