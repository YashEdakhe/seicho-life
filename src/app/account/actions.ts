"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Ends the session in the database and clears the cookie (via the nextCookies plugin). */
export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
