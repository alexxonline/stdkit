import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authEnabled =
  (process.env.AUTH_ENABLED ?? "").trim().toLowerCase() === "true";

const SESSION_COOKIE = "better-auth.session_token";

export function proxy(request: NextRequest) {
  if (!authEnabled) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has(`__Secure-${SESSION_COOKIE}`);

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
