"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const defaultTypes = new Set([
  "Song",
  "Movie",
  "Podcast",
  "Video",
  "Place",
  "Article",
  "Book",
  "Show",
  "Date idea",
  "Link",
]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUrl(value: string) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export async function createSharedLink(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const selectedType = readText(formData, "link_type");
  const customType = readText(formData, "custom_type").replace(/\s+/g, " ").slice(0, 60);
  const url = normalizeUrl(readText(formData, "url"));
  const sourceTitle = readText(formData, "source_title") || null;
  const description = readText(formData, "description") || null;
  const isFavorite = readText(formData, "is_favorite") === "on";

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  const linkType =
    selectedType === "Custom"
      ? customType
      : defaultTypes.has(selectedType)
        ? selectedType
        : "";

  if (!title || !linkType) {
    redirect("/links?error=missing");
  }

  try {
    await db.query(
      `
        insert into public.shared_links (
          title,
          url,
          link_type,
          source_title,
          description,
          author_name,
          is_favorite
        )
        values ($1, $2, $3, $4, $5, $6, $7)
      `,
      [title, url, linkType, sourceTitle, description, authorName, isFavorite],
    );
    await sendMentionNotification({
      authorName,
      sourceType: "Favorites",
      sourceTitle: title,
      body: [description, sourceTitle, url].filter(Boolean).join("\n"),
      path: "/links",
    });
  } catch (error) {
    console.error(error);
    redirect("/links?error=save");
  }

  revalidatePath("/links");
  redirect("/links?saved=1");
}
