alter table public.daily_checkins replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.daily_checkins;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
