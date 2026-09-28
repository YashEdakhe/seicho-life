"use server";

/*
 * Cart mutations. Server actions are public POST endpoints, so every argument is checked
 * here and the cookie is re-read and re-validated rather than trusted. Stock is checked
 * but not reserved; reserving belongs to checkout.
 */

import { refresh } from "next/cache";
import { loadCartProducts, readCartEntries, writeCartEntries } from "@/data/cart";
import {
  MAX_LINE_QTY,
  MAX_LINES,
  isValidProductId,
  isValidSize,
  reconcile,
  toEntries,
  type CartActionResult,
  type CartEntry,
} from "@/lib/cart-types";

const INVALID: CartActionResult = { ok: false, error: "Something went wrong. Please try again." };
const UNAVAILABLE: CartActionResult = {
  ok: false,
  error: "This piece is no longer available.",
};

/** Reprice against the catalogue, save the tidied cart and return the new count. */
async function save(entries: CartEntry[], catalog: Awaited<ReturnType<typeof loadCartProducts>>) {
  const cart = reconcile(entries, catalog);
  await writeCartEntries(toEntries(cart));
  return cart.count;
}

function sameLine(productId: number, size: string) {
  return (e: CartEntry) => e.productId === productId && e.size === size;
}

export async function addToCart(
  productId: unknown,
  size: unknown,
  quantity: unknown = 1,
): Promise<CartActionResult> {
  if (!isValidProductId(productId) || !isValidSize(size)) return INVALID;
  if (!Number.isInteger(quantity) || (quantity as number) < 1) return INVALID;
  const qty = quantity as number;

  const entries = await readCartEntries();
  const existing = entries.find(sameLine(productId, size));
  if (!existing && entries.length >= MAX_LINES) {
    return { ok: false, error: "Your bag is full. Remove something to add this piece." };
  }

  const catalog = await loadCartProducts([...entries.map((e) => e.productId), productId]);
  const product = catalog.get(productId);
  if (!product?.isActive) return UNAVAILABLE;
  const stock = product.stock.get(size);
  if (stock === undefined) return { ok: false, error: `Size ${size} isn't available.` };
  if (stock === 0) return { ok: false, error: `Sold out in ${size}.` };

  const limit = Math.min(stock, MAX_LINE_QTY);
  const inBag = existing?.quantity ?? 0;
  if (inBag + qty > limit) {
    const reason = stock <= MAX_LINE_QTY ? `only ${stock} in stock` : `the limit is ${MAX_LINE_QTY}`;
    return {
      ok: false,
      error:
        inBag >= limit
          ? `You already have ${inBag} in ${size} in your bag (${reason}).`
          : `You can add ${limit - inBag} more in ${size} (${reason}).`,
    };
  }

  const next = existing
    ? entries.map((e) => (e === existing ? { ...e, quantity: inBag + qty } : e))
    : [...entries, { productId, size, quantity: qty }];
  return { ok: true, count: await save(next, catalog), message: `Added to bag: ${product.name}, ${size}.` };
}

export async function updateCartItem(
  productId: unknown,
  size: unknown,
  quantity: unknown,
): Promise<CartActionResult> {
  if (!isValidProductId(productId) || !isValidSize(size)) return INVALID;
  if (!Number.isInteger(quantity) || (quantity as number) < 0) return INVALID;
  if (quantity === 0) return removeCartItem(productId, size);
  const qty = quantity as number;

  const entries = await readCartEntries();
  const existing = entries.find(sameLine(productId, size));
  if (!existing) {
    refresh();
    return { ok: false, error: "That piece is no longer in your bag." };
  }

  const catalog = await loadCartProducts(entries.map((e) => e.productId));
  const product = catalog.get(productId);
  const stock = product?.isActive ? (product.stock.get(size) ?? 0) : 0;
  const limit = Math.min(stock, MAX_LINE_QTY);
  if (qty > limit) {
    // Stock may have changed since the page loaded; re-render it with current numbers.
    refresh();
    if (limit === 0) return UNAVAILABLE;
    return {
      ok: false,
      error: stock <= MAX_LINE_QTY ? `Only ${stock} left in ${size}.` : `The limit is ${MAX_LINE_QTY} per size.`,
    };
  }

  const next = entries.map((e) => (e === existing ? { ...e, quantity: qty } : e));
  const count = await save(next, catalog);
  refresh();
  return { ok: true, count };
}

export async function removeCartItem(productId: unknown, size: unknown): Promise<CartActionResult> {
  if (!isValidProductId(productId) || !isValidSize(size)) return INVALID;

  const entries = (await readCartEntries()).filter((e) => !sameLine(productId, size)(e));
  const count = await save(entries, await loadCartProducts(entries.map((e) => e.productId)));
  refresh();
  return { ok: true, count };
}
