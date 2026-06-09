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
