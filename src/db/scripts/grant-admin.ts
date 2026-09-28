/*
 * Grants the admin role to an existing user: npm run admin:grant -- someone@example.com
 * Pass --revoke to set them back to customer. This is the only way to change roles.
 */

import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { user } from "../schema";

async function main() {
  const args = process.argv.slice(2);
  const revoke = args.includes("--revoke");
  const email = args.find((arg) => !arg.startsWith("--"))?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run admin:grant -- <email> [--revoke]");
    process.exit(1);
  }

  const role = revoke ? "customer" : "admin";
  const updated = await db
    .update(user)
    .set({ role })
    .where(eq(user.email, email))
    .returning({ email: user.email });

  if (updated.length === 0) {
    console.error(`No user found with email ${email}.`);
    process.exit(1);
  }
  console.log(`${email} is now ${role === "admin" ? "an admin" : "a customer"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
