import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

export type MemoryMedia = {
  id: string;
  bucket_id: string;
  storage_path: string;
  media_type: "image" | "video" | "file";
  caption: string | null;
  file_name: string | null;
  content_type: string | null;
  file_size: number | null;
  created_at: string;
  preview_url: string;
  download_url: string;
};

export type MemoryRecord = {
  id: string;
  title: string;
  body: string | null;
  memory_type: string;
  memory_date: string | null;
  location_text: string | null;
  cover_path: string | null;
  author_name: string;
  is_favorite: boolean;
  created_at: string;
  media: MemoryMedia[];
};

type MemoryRow = Omit<MemoryRecord, "media"> & {
  media: Array<Omit<MemoryMedia, "preview_url" | "download_url">>;
};

export type MemoryImagePreview = {
  id: string;
  memory_title: string;
  caption: string | null;
  preview_url: string;
  created_at: string;
};

type MemoryImageRow = {
  id: string;
  bucket_id: string;
  storage_path: string;
  caption: string | null;
  file_name: string | null;
  content_type: string | null;
  created_at: string;
  memory_title: string;
};

export async function getRecentMemoryImages(limit = 4) {
  const result = await db.query<MemoryImageRow>(`
    select
      mm.id,
      mm.bucket_id,
      mm.storage_path,
      mm.caption,
      mm.file_name,
      mm.content_type,
      mm.created_at,
      m.title as memory_title
    from public.memory_media mm
    join public.memories m on m.id = mm.memory_id
    where mm.media_type = 'image'
    order by m.created_at desc, mm.sort_order asc, mm.created_at desc
    limit $1
  `, [limit]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey)
    : null;

  return await Promise.all(
    result.rows.map(async (media) => {
      let preview_url = `/api/memories/media/${media.id}`;

      if (admin) {
        const signedUrl = await admin.storage
          .from(media.bucket_id)
          .createSignedUrl(media.storage_path, 3600);

        if (!signedUrl.error && signedUrl.data?.signedUrl) {
          preview_url = signedUrl.data.signedUrl;
        }
      }

      return {
        id: media.id,
        memory_title: media.memory_title,
        caption: media.caption,
        preview_url,
        created_at: new Date(media.created_at).toISOString(),
      };
    }),
  );
}

export async function getMemories() {
  const result = await db.query<MemoryRow>(`
    select
      m.id,
      m.title,
      m.body,
      m.memory_type,
      m.memory_date,
      m.location_text,
      m.cover_path,
      m.author_name,
      m.is_favorite,
      m.created_at,
      coalesce(
        json_agg(
          json_build_object(
            'id', mm.id,
            'bucket_id', mm.bucket_id,
            'storage_path', mm.storage_path,
            'media_type', mm.media_type,
            'caption', mm.caption,
            'file_name', mm.file_name,
            'content_type', mm.content_type,
            'file_size', mm.file_size,
            'created_at', mm.created_at
          )
          order by mm.sort_order, mm.created_at
        ) filter (where mm.id is not null),
        '[]'
      ) as media
    from public.memories m
    left join public.memory_media mm on mm.memory_id = m.id
    group by m.id
    order by m.created_at desc
    limit 50
  `);

  return result.rows.map((memory) => ({
      ...memory,
      created_at: new Date(memory.created_at).toISOString(),
      memory_date: memory.memory_date
        ? new Date(memory.memory_date).toISOString().slice(0, 10)
        : null,
      media: memory.media.map((media) => ({
        ...media,
        created_at: new Date(media.created_at).toISOString(),
        preview_url: `/api/memories/media/${media.id}`,
        download_url: `/api/memories/media/${media.id}?download=1`,
      })),
    }));
}
