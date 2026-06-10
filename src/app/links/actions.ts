"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  normalizeSharedLinkType,
  normalizeSharedUrl,
  saveSharedLink,
} from "@/lib/shared-links-save";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createSharedLink(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const selectedType = readText(formData, "link_type");
  const customType = readText(formData, "custom_type").replace(/\s+/g, " ").slice(0, 60);
  const url = normalizeSharedUrl(readText(formData, "url"));
  const sourceTitle = readText(formData, "source_title") || null;
  const description = readText(formData, "description") || null;
  const isFavorite = readText(formData, "is_favorite") === "on";

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  const linkType = normalizeSharedLinkType(selectedType, customType);

  if (!title || !linkType) {
    redirect("/links?error=missing");
  }

  try {
    await saveSharedLink({
      authorName,
      title,
      linkType,
      url,
      sourceTitle,
      description,
      isFavorite,
    });
  } catch (error) {
    console.error(error);
    redirect("/links?error=save");
  }

  revalidatePath("/links");
  redirect("/links?saved=1");
}
