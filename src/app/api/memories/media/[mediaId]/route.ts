import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { hasPrivateMemoriesAccess } from "@/lib/private-memories";

type MediaRow = {
  id: string;
  bucket_id: string;
  storage_path: string;
  media_type: string;
  file_name: string | null;
  content_type: string | null;
  is_private: boolean;
};

function cleanFileName(fileName: string | null) {
  return (fileName || "jak-vee-memory")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .slice(0, 120) || "jak-vee-memory";
}

function contentDisposition(fileName: string, shouldDownload: boolean) {
  const disposition = shouldDownload ? "attachment" : "inline";
  return `${disposition}; filename="${fileName.replace(/"/g, "")}"`;
}

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
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaId } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || serviceKey === "your_supabase_service_role_key") {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
  }

  const result = await db.query<MediaRow>(
    `
      select
        mm.id,
        mm.bucket_id,
        mm.storage_path,
        mm.media_type,
        mm.file_name,
        mm.content_type,
        m.is_private
      from public.memory_media mm
      join public.memories m on m.id = mm.memory_id
      where mm.id = $1
      limit 1
    `,
    [mediaId],
  );

  const media = result.rows[0];
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  if (media.is_private && !(await hasPrivateMemoriesAccess())) {
    return NextResponse.json({ error: "Private folder locked" }, { status: 403 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const download = await supabaseAdmin.storage
    .from(media.bucket_id)
    .download(media.storage_path);

  if (download.error || !download.data) {
    return NextResponse.json({ error: "Media unavailable" }, { status: 404 });
  }

  const fileName = cleanFileName(media.file_name);
  const shouldDownload = request.nextUrl.searchParams.has("download");
  const body = await download.data.arrayBuffer();

  return new Response(body, {
    headers: {
      "Cache-Control": "private, max-age=120",
      "Content-Disposition": contentDisposition(fileName, shouldDownload),
      "Content-Type":
        media.content_type || download.data.type || "application/octet-stream",
    },
  });
}
