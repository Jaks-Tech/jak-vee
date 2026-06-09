import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/api/login",
  "/api/logout",
  "/favicon.ico",
  "/jv-logo.png",
  "/jv-logo.svg",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("jak_vee_session")?.value;
  const person = request.cookies.get("jak_vee_person")?.value;
  const secret = process.env.AUTH_SESSION_SECRET;

  if (secret && session === secret && (person === "Jak" || person === "Vee")) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
