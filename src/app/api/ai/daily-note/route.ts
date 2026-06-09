import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateText } from "@/lib/openai";

function todayInNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function createDailyNote() {
  const today = todayInNairobi();
  const existing = await db.query(
    `
      select id
      from public.love_notes
      where note_type = 'AI Daily Encouragement'
        and scheduled_for::date = $1::date
      limit 1
    `,
    [today],
  );

  if (existing.rowCount) {
    return { created: false, date: today };
  }

  const body = await generateText(
    `Write a short daily encouragement for Jak and Vee for ${today}.
Include affection, affirmation, and a gentle sentence about choosing each other today.
Keep it warm, personal, and under 90 words.`,
    "You write private romantic encouragement for a couple. Be sincere, soft, and not dramatic.",
  );

  await db.query(
    `
      insert into public.love_notes (
        title,
        body,
        note_type,
        scheduled_for,
        is_pinned,
        author_name
      )
      values ($1, $2, $3, $4, $5, $6)
    `,
    [
      "Daily encouragement",
      body,
      "AI Daily Encouragement",
      today,
      false,
      "Jak & Vee AI",
    ],
  );

  return { created: true, date: today };
}

export async function GET(request: NextRequest) {
  const secret = process.env.AI_CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (
    secret &&
    request.headers.get("x-ai-cron-secret") !== secret &&
    bearer !== secret
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await createDailyNote());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Daily note failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
