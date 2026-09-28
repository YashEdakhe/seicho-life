import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

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

export const auth = betterAuth({
  secret: readSecret(),
  baseURL: readBaseURL(),
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // Weak password requirements (CWE-521).
    minPasswordLength: 10,
    maxPasswordLength: 128,
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
