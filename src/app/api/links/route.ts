import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSharedLinks } from "@/lib/links";
import {
  normalizeSharedLinkType,
  normalizeSharedUrl,
  saveSharedLink,
} from "@/lib/shared-links-save";

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

  return NextResponse.json(await getSharedLinks());
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("jak_vee_session")?.value;
  const authorName = cookieStore.get("jak_vee_person")?.value;

  if (
    !process.env.AUTH_SESSION_SECRET ||
    session !== process.env.AUTH_SESSION_SECRET ||
    (authorName !== "Jak" && authorName !== "Vee")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const selectedType = String(body?.link_type ?? "").trim();
  const customType = String(body?.custom_type ?? "").trim();
  const linkType = normalizeSharedLinkType(selectedType, customType);
  const url = normalizeSharedUrl(String(body?.url ?? "").trim());
  const sourceTitle = String(body?.source_title ?? "").trim() || null;
  const description = String(body?.description ?? "").trim() || null;
  const isFavorite = Boolean(body?.is_favorite);

  if (!title || !linkType) {
    return NextResponse.json({ error: "Title and type are required." }, { status: 400 });
  }

  try {
    await saveSharedLink({
      authorName,
      title,
      linkType,
      url,
      sourceTitle,
      description,
      isFavorite,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Saving failed." }, { status: 500 });
  }

  revalidatePath("/links");
  return NextResponse.json({ saved: true });
}
