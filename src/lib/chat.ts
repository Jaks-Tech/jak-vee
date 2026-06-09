import { db } from "@/lib/db";

export type ChatMessageRecord = {
  id: string;
  body: string | null;
  author_name: string;
  message_type: "message" | "direction" | "question" | "idea" | "reminder";
  context_type: string;
  context_title: string | null;
  is_direction: boolean;
  reply_to_id: string | null;
  created_at: string;
};

export async function getChatMessages() {
  const result = await db.query<ChatMessageRecord>(`
    select
      id,
      body,
      author_name,
      message_type,
      context_type,
      context_title,
      is_direction,
      reply_to_id,
      created_at
    from public.chat_messages
    order by created_at asc
    limit 160
  `);

  return result.rows.map((message) => ({
    ...message,
    created_at: new Date(message.created_at).toISOString(),
  }));
}
