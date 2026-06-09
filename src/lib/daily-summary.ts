import { db } from "@/lib/db";
import { generateText } from "@/lib/openai";

export type DailySummaryRecord = {
  id: string;
  summary_date: string;
  summary: string;
  created_at: string;
  expires_at: string;
};

export function todayInNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function rowsFor(query: string, date: string) {
  const result = await db.query(query, [date]);
  return result.rows;
}

export async function cleanupExpiredDailySummaries() {
  await db.query("delete from public.ai_daily_summaries where expires_at <= now()");
}

export async function getLatestDailySummary() {
  await cleanupExpiredDailySummaries();

  const result = await db.query<DailySummaryRecord>(`
    select id, summary_date, summary, created_at, expires_at
    from public.ai_daily_summaries
    where expires_at > now()
    order by summary_date desc
    limit 1
  `);

  const summary = result.rows[0];
  if (!summary) return null;

  return {
    ...summary,
    summary_date: new Date(summary.summary_date).toISOString().slice(0, 10),
    created_at: new Date(summary.created_at).toISOString(),
    expires_at: new Date(summary.expires_at).toISOString(),
  };
}

export async function generateAndStoreDailySummary(date = todayInNairobi()) {
  await cleanupExpiredDailySummaries();

  const existing = await db.query<DailySummaryRecord>(
    `
      select id, summary_date, summary, created_at, expires_at
      from public.ai_daily_summaries
      where summary_date = $1::date
        and expires_at > now()
      limit 1
    `,
    [date],
  );

  if (existing.rows[0]) {
    return { created: false, summary: existing.rows[0] };
  }

  const [checkIns, notes, chat, memories, links, reminders] = await Promise.all([
    rowsFor(
      `
        select title, body, mood, location_label, author_name, created_at
        from public.daily_checkins
        where (created_at at time zone 'Africa/Nairobi')::date = $1::date
        order by created_at asc
      `,
      date,
    ),
    rowsFor(
      `
        select title, body, note_type, author_name, created_at
        from public.love_notes
        where (created_at at time zone 'Africa/Nairobi')::date = $1::date
        order by created_at asc
      `,
      date,
    ),
    rowsFor(
      `
        select body, message_type, context_type, author_name, created_at
        from public.chat_messages
        where (created_at at time zone 'Africa/Nairobi')::date = $1::date
        order by created_at asc
      `,
      date,
    ),
    rowsFor(
      `
        select title, body, memory_type, author_name, created_at
        from public.memories
        where (created_at at time zone 'Africa/Nairobi')::date = $1::date
        order by created_at asc
      `,
      date,
    ),
    rowsFor(
      `
        select title, link_type, source_title, description, author_name, created_at
        from public.shared_links
        where (created_at at time zone 'Africa/Nairobi')::date = $1::date
        order by created_at asc
      `,
      date,
    ),
    rowsFor(
      `
        select title, event_type, date_value, notes, author_name, created_at
        from public.anniversaries
        where (created_at at time zone 'Africa/Nairobi')::date = $1::date
        order by created_at asc
      `,
      date,
    ),
  ]);

  const summary = await generateText(
    `Create the daily private couple dashboard summary for ${date}.

Return four short sections exactly:
What happened today
Mood of the day
Things to follow up
Sweet closing message

Data:
Check-ins: ${JSON.stringify(checkIns)}
Notes: ${JSON.stringify(notes)}
Chat: ${JSON.stringify(chat)}
Memories: ${JSON.stringify(memories)}
Links: ${JSON.stringify(links)}
Reminders: ${JSON.stringify(reminders)}`,
    "You are a warm, concise assistant for a private couple dashboard. Do not invent events; if data is empty, say so gently.",
  );

  const saved = await db.query<DailySummaryRecord>(
    `
      insert into public.ai_daily_summaries (
        summary_date,
        summary,
        expires_at
      )
      values ($1, $2, now() + interval '24 hours')
      on conflict (summary_date) do update
      set summary = excluded.summary,
          created_at = now(),
          expires_at = now() + interval '24 hours'
      returning id, summary_date, summary, created_at, expires_at
    `,
    [date, summary],
  );

  return { created: true, summary: saved.rows[0] };
}
