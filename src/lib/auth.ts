import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, validateName } from "@/lib/auth-validation";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Without a secret Better Auth falls back to a public, hard-coded one, so sessions
 * could be forged (CWE-798 / CWE-1188). Require a long random value in production.
 * Generate one with: openssl rand -base64 32
 */
function readSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (isProduction && (!secret || secret.length < 32)) {
    throw new Error("BETTER_AUTH_SECRET must be set to a random value of at least 32 characters");
  }
  return secret;
}

/**
 * A fixed base URL stops auth links and origin checks from trusting the request's
 * Host header (CWE-644).
 */
function readBaseURL() {
  const baseURL = process.env.BETTER_AUTH_URL;
  if (isProduction && !baseURL) {
    throw new Error("BETTER_AUTH_URL must be set in production");
  }
  return baseURL;
}

/**
 * The header that carries the real client IP, used to key rate limits. Better Auth's
 * default, x-forwarded-for, can be sent by anyone, so an attacker could rotate fake IPs
 * to get past the sign-in limit (CWE-348 / CWE-307). Set AUTH_IP_HEADER to the header
 * your host sets and strips from incoming requests:
 *   Vercel: x-vercel-forwarded-for · Cloudflare: cf-connecting-ip
 *   Nginx:  x-real-ip (with `proxy_set_header X-Real-IP $remote_addr;`)
 */
function readIpHeader() {
  const header = process.env.AUTH_IP_HEADER?.trim().toLowerCase();
  if (isProduction && !header) {
    throw new Error("AUTH_IP_HEADER must be set in production (see src/lib/auth.ts)");
  }
  return header || "x-forwarded-for";
}

/**
 * Server-side checks for user fields. Better Auth only requires `name` to be a string on
 * sign-up and accepts any value on /update-user, so without this the form's limits could
 * be skipped by calling the API directly (CWE-20 / CWE-770).
 */
function checkUserFields(user: Record<string, unknown>) {
  // Updates pass name: undefined when the name isn't changing.
  if (user.name !== undefined) {
    const error = typeof user.name === "string" ? validateName(user.name) : "Name must be text.";
    if (error) throw new APIError("BAD_REQUEST", { message: error });
  }
  // No feature uses profile images yet, so don't store arbitrary URLs.
  if (user.image !== undefined && user.image !== null) {
    throw new APIError("BAD_REQUEST", { message: "Profile images aren't supported." });
  }
  return typeof user.name === "string" ? { ...user, name: user.name.trim() } : user;
}

export const auth = betterAuth({
  secret: readSecret(),
  baseURL: readBaseURL(),
  advanced: {
    ipAddress: { ipAddressHeaders: [readIpHeader()] },
  },
  databaseHooks: {
    user: {
      create: { before: async (user) => ({ data: checkUserFields(user) as typeof user }) },
      update: { before: async (user) => ({ data: checkUserFields(user) }) },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      // "customer" | "admin". input: false stops sign-up requests from choosing their own
      // role; admins are granted only with `npm run admin:grant`.
      role: { type: "string", required: true, defaultValue: "customer", input: false },
    },
  },
  // Database-backed sessions: a 30-day cookie, extended at most once a day while in use.
  // No cookie cache, so sign-outs and role changes apply on the next request.
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  emailAndPassword: {
    enabled: true,
    // Weak password requirements (CWE-521).
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    // A reset should end any session an attacker already holds (CWE-613).
    revokeSessionsOnPasswordReset: true,
  },
  // Brute-force protection (CWE-307). The default in-memory store is per server
  // instance, so on serverless each instance would count attempts separately;
  // the database keeps one shared counter.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  // nextCookies must be the last plugin in the array
  plugins: [nextCookies()],
});
