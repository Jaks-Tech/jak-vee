import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";
import { hasPrivateMemoriesAccess } from "@/lib/private-memories";

const allowedTargetTypes = new Set([
  "daily_checkin",
  "love_note",
  "memory",
  "memory_media",
  "shared_link",
  "anniversary",
  "story_chapter",
  "chat_message",
  "comment",
  "love_drop",
]);

type Params = Promise<{ targetType: string; targetId: string }>;

async function readPerson() {
  const cookieStore = await cookies();
  const session = cookieStore.get("jak_vee_session")?.value;
  const person = cookieStore.get("jak_vee_person")?.value;

  if (
    !process.env.AUTH_SESSION_SECRET ||
    session !== process.env.AUTH_SESSION_SECRET ||
    (person !== "Jak" && person !== "Vee")
  ) {
    return null;
  }

  return person;
}

function validTarget(targetType: string, targetId: string) {
  return allowedTargetTypes.has(targetType) && /^[0-9a-f-]{36}$/i.test(targetId);
}

async function canAccessTarget(targetType: string, targetId: string) {
  if (targetType === "memory") {
    const result = await db.query<{ is_private: boolean }>(
      "select is_private from public.memories where id = $1 limit 1",
      [targetId],
    );
    return !result.rows[0]?.is_private || (await hasPrivateMemoriesAccess());
  }

  if (targetType === "memory_media") {
    const result = await db.query<{ is_private: boolean }>(
      `
        select m.is_private
        from public.memory_media mm
        join public.memories m on m.id = mm.memory_id
        where mm.id = $1
        limit 1
      `,
      [targetId],
    );
    return !result.rows[0]?.is_private || (await hasPrivateMemoriesAccess());
  }

  return true;
}

async function interactionState(targetType: string, targetId: string, person: string) {
  const [likes, liked, comments, shares] = await Promise.all([
    db.query(
      `
        select count(*)::int as count
        from public.reactions
        where target_type = $1 and target_id = $2 and emoji = 'heart'
      `,
      [targetType, targetId],
    ),
    db.query(
      `
        select id
        from public.reactions
        where target_type = $1 and target_id = $2 and emoji = 'heart' and author_name = $3
        limit 1
      `,
      [targetType, targetId, person],
    ),
    db.query(
      `
        select id, author_name, body, created_at
        from public.comments
        where target_type = $1 and target_id = $2
        order by created_at asc
        limit 50
      `,
      [targetType, targetId],
    ),
    db.query(
      `
        select count(*)::int as count
        from public.shares
        where target_type = $1 and target_id = $2
      `,
      [targetType, targetId],
    ),
  ]);

  return {
    likes: likes.rows[0]?.count ?? 0,
    liked: (liked.rowCount ?? 0) > 0,
    shares: shares.rows[0]?.count ?? 0,
    comments: comments.rows.map((comment) => ({
      ...comment,
      created_at: new Date(comment.created_at).toISOString(),
    })),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const person = await readPerson();
  if (!person) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetId } = await params;
  if (!validTarget(targetType, targetId)) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }
  if (!(await canAccessTarget(targetType, targetId))) {
    return NextResponse.json({ error: "Private folder locked" }, { status: 403 });
  }

  return NextResponse.json(await interactionState(targetType, targetId, person));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  const person = await readPerson();
  if (!person) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetId } = await params;
  if (!validTarget(targetType, targetId)) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }
  if (!(await canAccessTarget(targetType, targetId))) {
    return NextResponse.json({ error: "Private folder locked" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const action = String(payload?.action ?? "");

  if (action === "like") {
    const existing = await db.query(
      `
        select id
        from public.reactions
        where target_type = $1 and target_id = $2 and emoji = 'heart' and author_name = $3
        limit 1
      `,
      [targetType, targetId, person],
    );

    if ((existing.rowCount ?? 0) > 0) {
      await db.query("delete from public.reactions where id = $1", [
        existing.rows[0].id,
      ]);
    } else {
      await db.query(
        `
          insert into public.reactions (target_type, target_id, emoji, author_name)
          values ($1, $2, 'heart', $3)
        `,
        [targetType, targetId, person],
      );
    }

    return NextResponse.json(await interactionState(targetType, targetId, person));
  }

  if (action === "comment") {
    const body = String(payload?.body ?? "").trim();
    const path = String(payload?.path ?? "/");
    const title = String(payload?.title ?? targetType).trim();

    if (!body) {
      return NextResponse.json({ error: "Comment required" }, { status: 400 });
    }

    await db.query(
      `
        insert into public.comments (target_type, target_id, body, author_name)
        values ($1, $2, $3, $4)
      `,
      [targetType, targetId, body, person],
    );

    await sendMentionNotification({
      authorName: person,
      sourceType: "Comment",
      sourceTitle: title,
      body,
      path,
    });

    return NextResponse.json(await interactionState(targetType, targetId, person));
  }

  if (action === "share") {
    const path = String(payload?.path ?? "/");
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jak-vee.us").replace(/\/$/, "");
    const url = new URL(path, baseUrl);
    url.searchParams.set("item", targetId);
    const shareUrl = url.toString();

    await db.query(
      `
        insert into public.shares (target_type, target_id, share_url, author_name)
        values ($1, $2, $3, $4)
      `,
      [targetType, targetId, shareUrl, person],
    );

    return NextResponse.json({
      ...(await interactionState(targetType, targetId, person)),
      shareUrl,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
