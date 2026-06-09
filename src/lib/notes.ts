import { db } from "@/lib/db";

export type LoveNoteRecord = {
  id: string;
  title: string;
  body: string;
  note_type: string;
  author_name: string;
  is_pinned: boolean;
  scheduled_for: string | null;
  created_at: string;
};

export async function getLoveNotes() {
  const result = await db.query<LoveNoteRecord>(`
    select
      id,
      title,
      body,
      note_type,
      author_name,
      is_pinned,
      scheduled_for,
      created_at
    from public.love_notes
    order by is_pinned desc, created_at desc
    limit 80
  `);

  return result.rows.map((note) => ({
    ...note,
    created_at: new Date(note.created_at).toISOString(),
    scheduled_for: note.scheduled_for
      ? new Date(note.scheduled_for).toISOString().slice(0, 10)
      : null,
  }));
}
