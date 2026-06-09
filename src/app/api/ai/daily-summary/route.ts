import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  generateAndStoreDailySummary,
  getLatestDailySummary,
} from "@/lib/daily-summary";

async function isAllowed() {
  const cookieStore = await cookies();
  const session = cookieStore.get("jak_vee_session")?.value;
  const person = cookieStore.get("jak_vee_person")?.value;

  return (
    Boolean(process.env.AUTH_SESSION_SECRET) &&
    session === process.env.AUTH_SESSION_SECRET &&
    (person === "Jak" || person === "Vee")
  );
}

function isCronAllowed(request: NextRequest) {
  const secret = process.env.AI_CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return (
    !secret ||
    request.headers.get("x-ai-cron-secret") === secret ||
    bearer === secret
  );
}

export async function GET() {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ summary: await getLatestDailySummary() });
}

export async function POST(request: NextRequest) {
  if (!(await isAllowed()) && !isCronAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await generateAndStoreDailySummary());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Daily summary failed" }, { status: 500 });
  }
}
