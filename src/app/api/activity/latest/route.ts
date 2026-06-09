import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type ActivityRow = {
  id: number;
  table_name: string;
  action: string;
  created_at: string;
};

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

export async function GET() {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.query<ActivityRow>(`
      select id, table_name, action, created_at
      from public.activity_events
      order by id desc
      limit 1
    `);

    return NextResponse.json(result.rows[0] ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
