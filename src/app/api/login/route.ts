import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const person = String(formData.get("person") ?? "");
  const next = String(formData.get("next") ?? "/");

  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;
  const sessionSecret = process.env.AUTH_SESSION_SECRET;

  const isValid =
    Boolean(expectedUsername) &&
    Boolean(expectedPassword) &&
    Boolean(sessionSecret) &&
    username === expectedUsername &&
    password === expectedPassword &&
    (person === "Jak" || person === "Vee");

  if (!isValid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", safeNextPath(next));
    return NextResponse.redirect(loginUrl, 303);
  }

  const redirectUrl = new URL(safeNextPath(next), request.url);
  const response = NextResponse.redirect(redirectUrl, 303);

  response.cookies.set("jak_vee_session", sessionSecret!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("jak_vee_person", person, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
