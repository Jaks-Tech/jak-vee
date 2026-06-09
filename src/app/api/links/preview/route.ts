import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

function meta(content: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export async function POST(request: Request) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const url = String(body?.url ?? "").trim();

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "JakVeeBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    return NextResponse.json({
      title:
        meta(html, "og:title") ||
        html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
        null,
      description: meta(html, "og:description") || meta(html, "description"),
      image: meta(html, "og:image"),
      site: meta(html, "og:site_name"),
      url,
    });
  } catch {
    return NextResponse.json({ error: "Preview unavailable" }, { status: 502 });
  }
}
