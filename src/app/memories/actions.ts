"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const allowedTypes = new Set([
  "text",
  "photo",
  "video",
  "memory",
  "moment",
  "date",
  "trip",
  "gift",
  "place",
  "letter",
  "song",
  "anniversary",
  "surprise",
]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function mediaTypeFor(file: File) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
}

function extensionFor(fileName: string) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : null;
  return extension?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "upload";
}

export async function createMemory(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const body = readText(formData, "body") || null;
  const memoryType = readText(formData, "memory_type") || "memory";
  const memoryDate = readText(formData, "memory_date") || null;
  const locationText = readText(formData, "location_text") || null;
  const caption = readText(formData, "caption") || null;
  const files = formData
    .getAll("media")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  if (!title || !allowedTypes.has(memoryType)) {
    redirect("/memories?error=missing");
  }

  const client = await db.connect();

  try {
    await client.query("begin");

    const memoryResult = await client.query<{ id: string }>(
      `
        insert into public.memories (
          title,
          body,
          memory_type,
          memory_date,
          location_text,
          author_name
        )
        values ($1, $2, $3, $4, $5, $6)
        returning id
      `,
      [title, body, memoryType, memoryDate, locationText, authorName],
    );

    const memoryId = memoryResult.rows[0].id;

    if (files.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey || serviceKey === "your_supabase_service_role_key") {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for uploads.");
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceKey);
      let coverPath: string | null = null;

      for (const [index, file] of files.entries()) {
        const storagePath = `${memoryId}/${randomUUID()}.${extensionFor(file.name)}`;
        const mediaType = mediaTypeFor(file);

        const upload = await supabaseAdmin.storage
          .from("memories-media")
          .upload(storagePath, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (upload.error) {
          throw upload.error;
        }

        await client.query(
          `
            insert into public.memory_media (
              memory_id,
              uploader_name,
              bucket_id,
              storage_path,
              media_type,
              caption,
              file_name,
              content_type,
              file_size,
              sort_order
            )
            values ($1, $2, 'memories-media', $3, $4, $5, $6, $7, $8, $9)
          `,
          [
            memoryId,
            authorName,
            storagePath,
            mediaType,
            caption,
            file.name,
            file.type || null,
            file.size,
            index,
          ],
        );

        coverPath ??= storagePath;
      }

      if (coverPath) {
        await client.query(
          "update public.memories set cover_path = $1 where id = $2",
          [coverPath, memoryId],
        );
      }
    }

    await client.query("commit");
    await sendMentionNotification({
      authorName,
      sourceType: "Memories",
      sourceTitle: title,
      body: [body, caption, locationText].filter(Boolean).join("\n"),
      path: "/memories",
    });
  } catch (error) {
    await client.query("rollback");
    console.error(error);
    redirect("/memories?error=upload");
  } finally {
    client.release();
  }

  revalidatePath("/memories");
  redirect("/memories?saved=1");
}
