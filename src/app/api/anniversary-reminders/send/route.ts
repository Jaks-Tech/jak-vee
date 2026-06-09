import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { occurrenceKey } from "@/lib/anniversaries";

type DueEvent = {
  id: string;
  title: string;
  event_type: string;
  date_value: Date | string;
  event_time: string;
  reminder_rule: "once" | "monthly" | "yearly";
  notes: string | null;
  email_recipients: string[];
  email_subject: string | null;
  email_message: string | null;
  last_email_occurrence_key: string | null;
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

function dueOccurrence(event: DueEvent, now: Date) {
  const { year, month, day } = parseDateParts(event.date_value);
  const { hour, minute } = parseTimeParts(event.event_time);

  if (event.reminder_rule === "once") {
    return buildOccurrence(year, month, day, hour, minute);
  }

  if (event.reminder_rule === "monthly") {
    return buildOccurrence(
      now.getFullYear(),
      now.getMonth() + 1,
      day,
      hour,
      minute,
    );
  }

  return buildOccurrence(now.getFullYear(), month, day, hour, minute);
}

function isDue(target: Date, now: Date) {
  const diff = now.getTime() - target.getTime();
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

async function sendEmail(event: DueEvent) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_EMAIL_FROM;

  if (!apiKey || !from) {
    return { ok: false, reason: "Email provider is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: event.email_recipients,
      subject: event.email_subject || `Reminder: ${event.title}`,
      text:
        event.email_message ||
        `${event.title}\n\n${event.notes || "Today is one of your special days."}`,
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: await response.text() };
  }

  return { ok: true, reason: "sent" };
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REMINDER_CRON_SECRET;
  const providedSecret = request.headers.get("x-reminder-secret");

  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.query<DueEvent>(`
    select
      id,
      title,
      event_type,
      date_value,
      event_time::text,
      reminder_rule,
      notes,
      email_recipients,
      email_subject,
      email_message,
      last_email_occurrence_key
    from public.anniversaries
    where email_enabled = true
      and cardinality(email_recipients) > 0
  `);

  const now = new Date();
  const outcomes = [];

  for (const event of result.rows) {
    const occurrence = dueOccurrence(event, now);
    const key = occurrenceKey(occurrence);

    if (!isDue(occurrence, now) || event.last_email_occurrence_key === key) {
      continue;
    }

    const sent = await sendEmail(event);
    outcomes.push({ id: event.id, title: event.title, ...sent });

    if (sent.ok) {
      await db.query(
        `
          update public.anniversaries
          set last_email_sent_at = now(),
              last_email_occurrence_key = $1
          where id = $2
        `,
        [key, event.id],
      );
    }
  }

  return NextResponse.json({ checked: result.rowCount, outcomes });
}
