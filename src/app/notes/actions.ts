"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const defaultNoteTypes = new Set([
  "Our to-do",
  "Words of affirmation",
  "Plans of the day",
  "Private note",
  "Reminder",
  "Prayer or wish",
  "Date idea",
]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCustomType(value: string) {
  return value.replace(/\s+/g, " ").slice(0, 60);
}

export async function createLoveNote(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const body = readText(formData, "body");
  const selectedType = readText(formData, "note_type");
  const customType = normalizeCustomType(readText(formData, "custom_type"));
  const scheduledFor = readText(formData, "scheduled_for") || null;
  const isPinned = readText(formData, "is_pinned") === "on";

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  const noteType =
    selectedType === "custom"
      ? customType
      : defaultNoteTypes.has(selectedType)
        ? selectedType
        : "";

  if (!title || !body || !noteType) {
    redirect("/notes?error=missing");
  }

  try {
    await db.query(
      `
        insert into public.love_notes (
          title,
          body,
          note_type,
          scheduled_for,
          is_pinned,
          author_name
        )
        values ($1, $2, $3, $4, $5, $6)
      `,
      [title, body, noteType, scheduledFor, isPinned, authorName],
    );
    await sendMentionNotification({
      authorName,
      sourceType: "Notes",
      sourceTitle: title,
      body,
      path: "/notes",
    });
  } catch (error) {
    console.error(error);
    redirect("/notes?error=save");
  }

  revalidatePath("/notes");
  redirect("/notes?saved=1");
}
