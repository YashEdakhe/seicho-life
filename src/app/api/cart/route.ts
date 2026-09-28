import { getCart } from "@/data/cart";

/**
 * Bag count for the header icon. The header is shared by statically cached pages, so it
 * can't read the cart cookie while rendering; the badge fetches this once on load instead.
 */
export async function GET() {
  const { count } = await getCart();
  return Response.json({ count }, { headers: { "Cache-Control": "private, no-store" } });
}
