"use server";

import { redirect } from "next/navigation";
import {
  clearPrivateMemoriesAccess,
  grantPrivateMemoriesAccess,
  isPrivatePassword,
} from "@/lib/private-memories";

export async function unlockPrivateMemories(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isPrivatePassword(password)) {
    redirect("/memories/private?error=private-password");
  }

  await grantPrivateMemoriesAccess();
  redirect("/memories/private");
}

export async function lockPrivateMemories() {
  await clearPrivateMemoriesAccess();
  redirect("/memories/private");
}
