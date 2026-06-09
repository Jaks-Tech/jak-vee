import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("jak_vee_session")?.value;
  const person = cookieStore.get("jak_vee_person")?.value;

  if (
    !process.env.AUTH_SESSION_SECRET ||
    session !== process.env.AUTH_SESSION_SECRET ||
    (person !== "Jak" && person !== "Vee")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.query(`
    select
      id,
      checkin_type,
      title,
      body,
      mood,
      location_label,
      meet_time,
      is_custom,
      author_name,
      created_at
    from public.daily_checkins
    order by created_at desc
    limit 20
  `);

  return NextResponse.json(result.rows);
}
