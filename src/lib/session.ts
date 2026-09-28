/*
 * Server-side session checks (the Data Access Layer). Every protected page, server action
 * and route handler must call requireUser() or requireAdmin() itself: src/proxy.ts only
 * checks that a session cookie exists, and hiding a page does not protect the actions
 * behind it.
 *
 * Calling headers() makes a page render per request, so signed-in pages never enter the
 * storefront's shared 5-minute cache.
 */

import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/** The current session (user + session), or null. One database lookup per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Signed-in customers only; everyone else is sent to sign-in and brought back after. */
export async function requireUser(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return session;
}

/** Admins only. Signed-in non-admins get a 404 so admin routes aren't confirmed to exist. */
export async function requireAdmin() {
  const session = await requireUser("/admin");
  if (session.user.role !== "admin") notFound();
  return session;
}

const RETURN_BASE = "http://seicho.invalid";

/**
 * Where to go after signing in. Only same-site paths are allowed, so ?next= can't send
 * people to another site (CWE-601). String checks alone aren't enough: browsers drop tabs
 * and newlines and treat "\" as "/", so "/\t/evil.example" becomes "//evil.example".
 * Control characters and backslashes are rejected, then the URL is parsed the way a
 * browser would and must stay on this site.
 */
export function safeReturnPath(next: string | string[] | undefined) {
  if (typeof next !== "string" || !next.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(next)) {
    return "/account";
  }
  const url = new URL(next, RETURN_BASE);
  return url.origin === RETURN_BASE ? url.pathname + url.search + url.hash : "/account";
}
