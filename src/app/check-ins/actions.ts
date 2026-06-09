"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dailyCheckIns } from "@/data/content";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const allowedTypes = new Set([
  ...dailyCheckIns.map((checkIn) => checkIn.type),
  "custom",
]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createCheckIn(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const body = readText(formData, "body");
  const checkinType = readText(formData, "checkin_type") || "custom";
  const promptKey = readText(formData, "prompt_key") || null;
  const mood = readText(formData, "mood") || null;
  const locationLabel = readText(formData, "location_label") || null;
  const meetTime = readText(formData, "meet_time") || null;
  const isCustom = readText(formData, "is_custom") === "true";

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  if (!title || !body || !allowedTypes.has(checkinType)) {
    redirect("/check-ins?error=missing");
  }

  await db.query(
    `
      insert into public.daily_checkins (
        checkin_type,
        title,
        body,
        prompt_key,
        mood,
        location_label,
        meet_time,
        is_custom,
        author_name
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      checkinType,
      title,
      body,
      promptKey,
      mood,
      locationLabel,
      meetTime || null,
      isCustom,
      authorName,
    ],
  );

  await sendMentionNotification({
    authorName,
    sourceType: "Check-ins",
    sourceTitle: title,
    body,
    path: "/check-ins",
  });

  revalidatePath("/check-ins");
  redirect("/check-ins?saved=1");
}
