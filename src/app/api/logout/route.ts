import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("jak_vee_session", "", cookieOptions);
  response.cookies.set("jak_vee_person", "", cookieOptions);
  response.cookies.set("jak_vee_private_memories", "", cookieOptions);
  return response;
}
