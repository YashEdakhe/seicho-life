import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast first filter for signed-in areas: no session cookie, straight to sign-in.
 * It only checks the cookie exists (no database call); pages still verify the session
 * with requireUser() / requireAdmin() from src/lib/session.ts.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", pathname + search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
