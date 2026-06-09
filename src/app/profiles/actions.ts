"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function extensionFor(fileName: string) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : null;
  return extension?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "jpg";
}

function readHandles(value: string) {
  return value
    .split(",")
    .map((handle) => handle.trim().replace(/^@+/, "").toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const personName = readText(formData, "person_name");
  const displayName = readText(formData, "display_name") || personName;
  const bio = readText(formData, "bio") || null;
  const mentionHandles = readHandles(readText(formData, "mention_handles"));
  const discordUserId = readText(formData, "discord_user_id") || null;
  const discordMentionsEnabled =
    readText(formData, "discord_mentions_enabled") === "on";
  const file = formData.get("avatar");

  if (currentPerson !== "Jak" && currentPerson !== "Vee") {
    redirect("/login");
  }

  if (personName !== "Jak" && personName !== "Vee") {
    redirect("/profiles?error=missing");
  }

  let avatarPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      redirect("/profiles?error=image");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      redirect("/profiles?error=upload");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    avatarPath = `${personName}/${randomUUID()}.${extensionFor(file.name)}`;

    const upload = await supabaseAdmin.storage
      .from("avatars")
      .upload(avatarPath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      console.error(upload.error);
      redirect("/profiles?error=upload");
    }
  }

  try {
    await db.query(
      `
        insert into public.couple_profiles (
          person_name,
          display_name,
          bio,
          avatar_path,
          mention_handles,
          discord_user_id,
          discord_mentions_enabled,
          updated_by
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        on conflict (person_name) do update
        set display_name = excluded.display_name,
            bio = excluded.bio,
            avatar_path = coalesce(excluded.avatar_path, public.couple_profiles.avatar_path),
            mention_handles = excluded.mention_handles,
            discord_user_id = excluded.discord_user_id,
            discord_mentions_enabled = excluded.discord_mentions_enabled,
            updated_by = excluded.updated_by,
            updated_at = now()
      `,
      [
        personName,
        displayName,
        bio,
        avatarPath,
        mentionHandles.length > 0 ? mentionHandles : [personName.toLowerCase()],
        discordUserId,
        discordMentionsEnabled,
        currentPerson,
      ],
    );
  } catch (error) {
    console.error(error);
    redirect("/profiles?error=save");
  }

  revalidatePath("/");
  revalidatePath("/profiles");
  redirect("/profiles?saved=1");
}
