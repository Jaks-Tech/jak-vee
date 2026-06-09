import { db } from "@/lib/db";

export type SharedLinkRecord = {
  id: string;
  title: string;
  url: string | null;
  link_type: string;
  source_title: string | null;
  description: string | null;
  author_name: string;
  is_favorite: boolean;
  created_at: string;
};

export async function getSharedLinks() {
  const result = await db.query<SharedLinkRecord>(`
    select
      id,
      title,
      url,
      link_type,
      source_title,
      description,
      author_name,
      is_favorite,
      created_at
    from public.shared_links
    order by is_favorite desc, created_at desc
    limit 100
  `);

  return result.rows.map((item) => ({
    ...item,
    created_at: new Date(item.created_at).toISOString(),
  }));
}
