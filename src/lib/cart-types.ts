/*
 * Client-safe cart types and pure helpers. Cookie access and queries live in
 * src/data/cart.ts (server-only); the actions are in src/app/cart/actions.ts.
 *
 * The cart cookie holds only what the shopper chose: [productId, size, quantity].
 * Prices and stock are never stored there; they are read from the database every time,
 * so an edited cookie can't change what anything costs or exceed available stock.
 */

/** Most units of one product + size a single bag may hold. */
export const MAX_LINE_QTY = 10;
/** Most separate lines a bag may hold; keeps the cookie well under the 4 KB limit. */
export const MAX_LINES = 30;
/** Postgres `integer` upper bound; larger ids can't exist and would make the query fail. */
const MAX_ID = 2_147_483_647;
const MAX_SIZE_LENGTH = 20;

export type CartEntry = { productId: number; size: string; quantity: number };

/** What reconcile() needs to know about a product, loaded fresh from the database. */
export type CartProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  isActive: boolean;
  /** Stock per size label. */
  stock: Map<string, number>;
};

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  /** The quantity that counts: already lowered to what is in stock. */
  quantity: number;
  /** Most this line can be raised to: stock, capped at MAX_LINE_QTY. */
  maxQuantity: number;
  lineTotal: number;
  /** "reduced": stock fell below what was in the bag. "unavailable": can't be bought now. */
  issue?: "reduced" | "unavailable";
};

export type Cart = {
  lines: CartLine[];
  /** Whole rupees, over lines that can be bought. */
  subtotal: number;
  /** Units that can be bought; shown on the header bag icon. */
  count: number;
};

export type CartActionResult =
  | { ok: true; count: number; message?: string }
  | { ok: false; error: string };

export function isValidProductId(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0 && (value as number) <= MAX_ID;
}

export function isValidSize(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_SIZE_LENGTH;
}

function isValidQuantity(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1;
}

/**
 * Read the cookie value into entries. Never throws: anything malformed is dropped,
 * repeated product + size pairs are merged, and the line and quantity caps applied.
 */
export function parseCartCookie(raw: string | undefined): CartEntry[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const entries: CartEntry[] = [];
  for (const item of data) {
    if (!Array.isArray(item) || item.length !== 3) continue;
    const [productId, size, quantity] = item;
    if (!isValidProductId(productId) || !isValidSize(size) || !isValidQuantity(quantity)) continue;

    const existing = entries.find((e) => e.productId === productId && e.size === size);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, MAX_LINE_QTY);
    } else if (entries.length < MAX_LINES) {
      entries.push({ productId, size, quantity: Math.min(quantity, MAX_LINE_QTY) });
    }
  }
  return entries;
}

export function serializeCart(entries: CartEntry[]) {
  return JSON.stringify(entries.map((e) => [e.productId, e.size, e.quantity]));
}

/**
 * Price the entries against current catalogue data. Lines whose product no longer exists
 * are dropped; inactive products, removed sizes and sold-out sizes are kept (so the
 * shopper sees what happened) but marked unavailable and left out of the totals.
 */
export function reconcile(entries: CartEntry[], catalog: Map<number, CartProduct>): Cart {
  const lines: CartLine[] = [];
  let subtotal = 0;
  let count = 0;

  for (const entry of entries) {
    const product = catalog.get(entry.productId);
    if (!product) continue;

    const stock = product.isActive ? (product.stock.get(entry.size) ?? 0) : 0;
    const maxQuantity = Math.min(stock, MAX_LINE_QTY);
    const unavailable = maxQuantity === 0;
    const reduced = !unavailable && entry.quantity > maxQuantity;
    const quantity = reduced ? maxQuantity : entry.quantity;
    const lineTotal = unavailable ? 0 : product.price * quantity;

    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: entry.size,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity,
      maxQuantity,
      lineTotal,
      issue: unavailable ? "unavailable" : reduced ? "reduced" : undefined,
    });
    if (!unavailable) {
      subtotal += lineTotal;
      count += quantity;
    }
  }

  return { lines, subtotal, count };
}

/** Entries to write back after reconcile(): reduced lines saved at their lowered quantity. */
export function toEntries(cart: Cart): CartEntry[] {
  return cart.lines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity }));
}
