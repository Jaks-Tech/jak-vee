import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getChatMessages } from "@/lib/chat";
import { sendMentionNotification } from "@/lib/mentions";

const messageTypes = new Set([
  "message",
  "direction",
  "question",
  "idea",
  "reminder",
]);

const contextTypes = new Set([
  "general",
  "memories",
  "check-ins",
  "notes",
  "anniversaries",
  "links",
  "story",
]);

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

export async function GET() {
  if (!(await readPerson())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getChatMessages());
}

export async function POST(request: NextRequest) {
  const person = await readPerson();

  if (!person) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";
  const messageType =
    typeof payload?.message_type === "string" && messageTypes.has(payload.message_type)
      ? payload.message_type
      : "message";
  const contextType =
    typeof payload?.context_type === "string" && contextTypes.has(payload.context_type)
      ? payload.context_type
      : "general";
  const contextTitle =
    typeof payload?.context_title === "string"
      ? payload.context_title.trim().slice(0, 80) || null
      : null;
  const replyToId =
    typeof payload?.reply_to_id === "string" && payload.reply_to_id.startsWith("pending-")
      ? null
      : typeof payload?.reply_to_id === "string"
        ? payload.reply_to_id
        : null;

  if (!body) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const result = await db.query(
    `
      insert into public.chat_messages (
        body,
        author_name,
        message_type,
        context_type,
        context_title,
        is_direction,
        reply_to_id
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        body,
        author_name,
        message_type,
        context_type,
        context_title,
        is_direction,
        reply_to_id,
        created_at
    `,
    [
      body,
      person,
      messageType,
      contextType,
      contextTitle,
      messageType === "direction",
      replyToId,
    ],
  );

  await sendMentionNotification({
    authorName: person,
    sourceType: "Chat",
    sourceTitle: contextTitle || contextType,
    body,
    path: "/chat",
  });

  return NextResponse.json({
    ...result.rows[0],
    created_at: new Date(result.rows[0].created_at).toISOString(),
  });
}
