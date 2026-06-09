"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const chapterTypes = new Set([
  "How we started",
  "Milestone",
  "Memory",
  "Challenge",
  "Dream",
  "Promise",
  "Lesson",
  "Future plan",
  "Chapter",
]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createStoryChapter(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const body = readText(formData, "body") || null;
  const selectedType = readText(formData, "chapter_type");
  const customType = readText(formData, "custom_type").replace(/\s+/g, " ").slice(0, 60);
  const chapterDate = readText(formData, "chapter_date") || null;
  const mood = readText(formData, "mood") || null;
  const isFavorite = readText(formData, "is_favorite") === "on";

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  const chapterType =
    selectedType === "Custom"
      ? customType
      : chapterTypes.has(selectedType)
        ? selectedType
        : "";

  if (!title || !chapterType) {
    redirect("/story?error=missing");
  }

  try {
    await db.query(
      `
        insert into public.story_chapters (
          title,
          body,
          chapter_type,
          chapter_date,
          mood,
          author_name,
          is_favorite
        )
        values ($1, $2, $3, $4, $5, $6, $7)
      `,
      [title, body, chapterType, chapterDate, mood, authorName, isFavorite],
    );
    await sendMentionNotification({
      authorName,
      sourceType: "Story",
      sourceTitle: title,
      body: [body, mood].filter(Boolean).join("\n"),
      path: "/story",
    });
  } catch (error) {
    console.error(error);
    redirect("/story?error=save");
  }

  revalidatePath("/story");
  redirect("/story?saved=1");
}
