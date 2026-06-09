alter table public.daily_checkins
  drop constraint if exists daily_checkins_checkin_type_check;

alter table public.daily_checkins
  add constraint daily_checkins_checkin_type_check
  check (
    checkin_type in (
      'morning',
      'plans',
      'goals',
      'location',
      'meet_time',
      'mood',
      'evening',
      'miss_you',
      'date_idea',
      'food_craving',
      'song_mood',
      'compliment',
      'prayer_wish',
      'memory_spark',
      'need_comfort',
      'grateful',
      'custom'
    )
  );
