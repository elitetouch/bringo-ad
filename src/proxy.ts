import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  // /login is always reachable. Proxy can't validate the token (that needs a
  // real API call), so it must not redirect away from /login just because a
  // cookie is present — a stale/expired token would otherwise trap the user
  // in an infinite loop with the dashboard layout's own 401 -> /login redirect,
  // since Server Components aren't allowed to clear cookies to break it from
  // that side. The login page itself checks a real session and redirects to
  // "/" if it's actually valid.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and the API routes (server
     * actions still enforce their own auth independently, per Next's guidance
     * that proxy alone shouldn't be relied on for auth).
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
