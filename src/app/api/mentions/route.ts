import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCoupleProfiles } from "@/lib/profiles";

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

  const profiles = await getCoupleProfiles();
  const mentions = profiles.flatMap((profile) => {
    const handles = profile.mention_handles.length
      ? profile.mention_handles
      : [profile.person_name.toLowerCase()];

    return handles.map((handle) => ({
      handle: handle.replace(/^@+/, "").toLowerCase(),
      label: profile.display_name || profile.person_name,
      person: profile.person_name,
    }));
  });

  return NextResponse.json([
    ...mentions,
    { handle: "both", label: "Both of us", person: "Jak & Vee" },
  ]);
}
