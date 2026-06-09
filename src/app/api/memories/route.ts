import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getMemories } from "@/lib/memories";

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

  return NextResponse.json(await getMemories());
}
