import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

type ProfileAvatarRow = {
  avatar_bucket: string;
  avatar_path: string | null;
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ person: string }> },
) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { person } = await params;
  if (person !== "Jak" && person !== "Vee") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await db.query<ProfileAvatarRow>(
    `
      select avatar_bucket, avatar_path
      from public.couple_profiles
      where person_name = $1
      limit 1
    `,
    [person],
  );

  const profile = result.rows[0];
  if (!profile?.avatar_path) {
    return NextResponse.json({ error: "No avatar" }, { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const avatar = await supabaseAdmin.storage
    .from(profile.avatar_bucket)
    .download(profile.avatar_path);

  if (avatar.error || !avatar.data) {
    return NextResponse.json({ error: "Avatar unavailable" }, { status: 404 });
  }

  return new Response(await avatar.data.arrayBuffer(), {
    headers: {
      "Cache-Control": "private, max-age=120",
      "Content-Type": avatar.data.type || "image/jpeg",
    },
  });
}
