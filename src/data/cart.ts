/*
 * Cart cookie access and the catalogue lookup behind it. Server-only: the cookie is
 * httpOnly, and prices and stock always come from the database, never from the client.
 */

import "server-only";

import { inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  parseCartCookie,
  reconcile,
  serializeCart,
  type CartEntry,
  type CartProduct,
} from "@/lib/cart-types";

const CART_COOKIE = "cart";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function readCartEntries() {
  return parseCartCookie((await cookies()).get(CART_COOKIE)?.value);
}

/** Only callable from a server action or route handler; an empty cart removes the cookie. */
export async function writeCartEntries(entries: CartEntry[]) {
  const store = await cookies();
  if (entries.length === 0) {
    store.delete(CART_COOKIE);
    return;
  }
  store.set(CART_COOKIE, serializeCart(entries), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

/**
 * Current price, status and per-size stock for the given products, inactive ones included
 * so the cart can say they're unavailable rather than silently dropping them.
 */
export async function loadCartProducts(ids: number[]): Promise<Map<number, CartProduct>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();

  const rows = await db.query.products.findMany({
    where: inArray(products.id, unique),
    columns: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      price: true,
      compareAtPrice: true,
      isActive: true,
    },
    with: { stock: { columns: { sizeLabel: true, quantity: true } } },
  });

  return new Map(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        slug: row.slug,
        name: row.name,
        image: row.imageUrl,
        price: row.price,
        compareAtPrice: row.compareAtPrice ?? undefined,
        isActive: row.isActive,
        stock: new Map(row.stock.map((s) => [s.sizeLabel, s.quantity])),
      },
    ]),
  );
}

/** The priced cart for this request. Reading cookies makes the calling route dynamic. */
export const getCart = cache(async () => {
  const entries = await readCartEntries();
  return reconcile(entries, await loadCartProducts(entries.map((e) => e.productId)));
});
