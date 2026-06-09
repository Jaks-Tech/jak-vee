alter table public.chat_messages
  alter column author_id drop not null;

alter table public.chat_messages
  add column if not exists author_name text not null default 'Jak & Vee',
  add column if not exists message_type text not null default 'message',
  add column if not exists context_type text not null default 'general',
  add column if not exists context_title text,
  add column if not exists is_direction boolean not null default false;

alter table public.chat_messages
  drop constraint if exists chat_messages_message_type_check;

alter table public.chat_messages
  add constraint chat_messages_message_type_check
  check (message_type in ('message', 'direction', 'question', 'idea', 'reminder'));

create index if not exists chat_messages_context_created_idx
on public.chat_messages(context_type, created_at desc);

create index if not exists chat_messages_author_name_created_idx
on public.chat_messages(author_name, created_at desc);

alter table public.chat_messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
