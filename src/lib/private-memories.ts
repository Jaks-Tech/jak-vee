import { cookies } from "next/headers";

const PRIVATE_COOKIE = "jak_vee_private_memories";

export function privateMemoriesPassword() {
  return process.env.PRIVATE_MEMORIES_PASSWORD || process.env.AUTH_PASSWORD || "";
}

export async function hasPrivateMemoriesAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PRIVATE_COOKIE)?.value;
  const password = privateMemoriesPassword();

  return Boolean(password) && token === password;
}

export async function grantPrivateMemoriesAccess() {
  const password = privateMemoriesPassword();
  if (!password) return;

  const cookieStore = await cookies();
  cookieStore.set(PRIVATE_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearPrivateMemoriesAccess() {
  const cookieStore = await cookies();
  cookieStore.set(PRIVATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isPrivatePassword(value: string) {
  const password = privateMemoriesPassword();
  return Boolean(password) && value === password;
}
