alter table public.comments
  drop constraint if exists comments_target_type_check;

alter table public.comments
  add constraint comments_target_type_check check (
    target_type in (
      'daily_checkin',
      'love_note',
      'memory',
      'memory_media',
      'shared_link',
      'anniversary',
      'story_chapter',
      'chat_message',
      'comment',
      'love_drop'
    )
  );

alter table public.reactions
  drop constraint if exists reactions_target_type_check;

alter table public.reactions
  add constraint reactions_target_type_check check (
    target_type in (
      'daily_checkin',
      'love_note',
      'memory',
      'memory_media',
      'shared_link',
      'anniversary',
      'story_chapter',
      'chat_message',
      'comment',
      'love_drop'
    )
  );

alter table public.shares
  drop constraint if exists shares_target_type_check;

alter table public.shares
  add constraint shares_target_type_check check (
    target_type in (
      'daily_checkin',
      'love_note',
      'memory',
      'memory_media',
      'shared_link',
      'anniversary',
      'story_chapter',
      'chat_message',
      'comment',
      'love_drop'
    )
  );

create table if not exists public.love_drops (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null default 'Vee',
  title text not null,
  body text not null,
  time_label text,
  media_id uuid references public.memory_media(id) on delete set null,
  sent_to_discord boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists love_drops_created_idx
on public.love_drops(created_at desc);

create index if not exists love_drops_recipient_created_idx
on public.love_drops(recipient_name, created_at desc);

alter table public.love_drops enable row level security;

drop policy if exists "love_drops_all_authenticated" on public.love_drops;
create policy "love_drops_all_authenticated"
on public.love_drops for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

alter table public.love_drops replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.love_drops;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
