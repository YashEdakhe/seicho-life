import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

/**
 * Auth responses carry personal data (email, session tokens, IP addresses from
 * list-sessions) and redirects whose URLs can hold one-time tokens. Better Auth only
 * marks get-session as uncacheable, so every response here is made private and
 * uncacheable (CWE-524 / CWE-525). Referrer-Policy for these URLs is set in next.config.ts,
 * which overrides headers set here.
 */
function secure(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    // Copy first: redirect responses have immutable headers.
    const original = await handler(request);
    const response = new Response(original.body, original);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    return response;
  };
}

export const GET = secure(handlers.GET);
export const POST = secure(handlers.POST);
