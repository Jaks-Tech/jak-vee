import { db } from "@/lib/db";

export type AnniversaryRecord = {
  id: string;
  title: string;
  event_type: string;
  date_value: string;
  event_time: string;
  timezone: string;
  reminder_rule: "once" | "monthly" | "yearly";
  notes: string | null;
  author_name: string;
  email_enabled: boolean;
  email_recipients: string[];
  email_subject: string | null;
  email_message: string | null;
  last_email_occurrence_key: string | null;
  created_at: string;
  next_occurrence_at: string | null;
  next_occurrence_key: string | null;
};

type AnniversaryRow = Omit<
  AnniversaryRecord,
  "date_value" | "created_at" | "next_occurrence_at" | "next_occurrence_key"
> & {
  date_value: Date | string;
  created_at: Date | string;
};

function parseDateParts(dateValue: Date | string) {
  const date = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

function parseTimeParts(timeValue: string) {
  const [hour, minute] = timeValue.slice(0, 5).split(":").map(Number);
  return { hour: hour || 0, minute: minute || 0 };
}

function buildOccurrence(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const safeDay = Math.min(day, new Date(year, month, 0).getDate());
  return new Date(year, month - 1, safeDay, hour, minute, 0, 0);
}

export function getNextOccurrence(
  dateValue: Date | string,
  eventTime: string,
  rule: "once" | "monthly" | "yearly",
  now = new Date(),
) {
  const { year, month, day } = parseDateParts(dateValue);
  const { hour, minute } = parseTimeParts(eventTime);

  if (rule === "once") {
    const once = buildOccurrence(year, month, day, hour, minute);
    return once >= now ? once : null;
  }

  if (rule === "monthly") {
    let occurrence = buildOccurrence(
      now.getFullYear(),
      now.getMonth() + 1,
      day,
      hour,
      minute,
    );

    if (occurrence < now) {
      occurrence = buildOccurrence(
        now.getFullYear(),
        now.getMonth() + 2,
        day,
        hour,
        minute,
      );
    }

    return occurrence;
  }

  let occurrence = buildOccurrence(now.getFullYear(), month, day, hour, minute);

  if (occurrence < now) {
    occurrence = buildOccurrence(now.getFullYear() + 1, month, day, hour, minute);
  }

  return occurrence;
}

export function occurrenceKey(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function getAnniversaryReminders() {
  const result = await db.query<AnniversaryRow>(`
    select
      id,
      title,
      event_type,
      date_value,
      event_time::text,
      timezone,
      reminder_rule,
      notes,
      author_name,
      email_enabled,
      email_recipients,
      email_subject,
      email_message,
      last_email_occurrence_key,
      created_at
    from public.anniversaries
    order by date_value asc, event_time asc
  `);

  return result.rows
    .map((event) => {
      const nextOccurrence = getNextOccurrence(
        event.date_value,
        event.event_time,
        event.reminder_rule,
      );

      return {
        ...event,
        date_value:
          event.date_value instanceof Date
            ? event.date_value.toISOString().slice(0, 10)
            : event.date_value.slice(0, 10),
        created_at: new Date(event.created_at).toISOString(),
        next_occurrence_at: nextOccurrence?.toISOString() ?? null,
        next_occurrence_key: nextOccurrence ? occurrenceKey(nextOccurrence) : null,
      };
    })
    .sort((a, b) => {
      if (!a.next_occurrence_at) return 1;
      if (!b.next_occurrence_at) return -1;
      return (
        new Date(a.next_occurrence_at).getTime() -
        new Date(b.next_occurrence_at).getTime()
      );
    });
}
