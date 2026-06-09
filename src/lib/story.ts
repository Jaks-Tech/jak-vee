import { db } from "@/lib/db";

export type StoryChapterRecord = {
  id: string;
  title: string;
  body: string | null;
  chapter_type: string;
  chapter_date: string | null;
  mood: string | null;
  author_name: string;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
};

export async function getStoryChapters() {
  const result = await db.query<StoryChapterRecord>(`
    select
      id,
      title,
      body,
      chapter_type,
      chapter_date,
      mood,
      author_name,
      is_favorite,
      sort_order,
      created_at
    from public.story_chapters
    order by
      coalesce(chapter_date, created_at::date) asc,
      sort_order asc,
      created_at asc
    limit 120
  `);

  return result.rows.map((chapter) => ({
    ...chapter,
    chapter_date: chapter.chapter_date
      ? new Date(chapter.chapter_date).toISOString().slice(0, 10)
      : null,
    created_at: new Date(chapter.created_at).toISOString(),
  }));
}
