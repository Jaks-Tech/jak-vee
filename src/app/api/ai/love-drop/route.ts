import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createLoveDrop } from "@/lib/love-drops";

async function isLoggedIn() {
  const cookieStore = await cookies();
  const session = cookieStore.get("jak_vee_session")?.value;
  const person = cookieStore.get("jak_vee_person")?.value;

  return (
    Boolean(process.env.AUTH_SESSION_SECRET) &&
    session === process.env.AUTH_SESSION_SECRET &&
    (person === "Jak" || person === "Vee")
  );
}

function hasCronAccess(request: NextRequest) {
  if (request.headers.get("x-vercel-cron")) return true;

  const secret = process.env.CRON_SECRET || process.env.AI_CRON_SECRET;
  if (!secret) return true;

  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  return auth === `Bearer ${secret}` || headerSecret === secret;
}

export async function GET(request: NextRequest) {
  if (!hasCronAccess(request) && !(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drop = await createLoveDrop({ notify: true });
  return NextResponse.json({ drop });
}

export async function POST() {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drop = await createLoveDrop({ notify: true });
  return NextResponse.json({ drop });
}
