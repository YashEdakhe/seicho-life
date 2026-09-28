"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { BagIcon } from "@/components/icons";

/*
 * The header bag count. The header is part of statically cached pages, so the count is
 * fetched from /api/cart after load and then kept current by the values cart actions return.
 */

let count: number | null = null;
const listeners = new Set<() => void>();

export function setCartCount(next: number) {
  count = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function CartCount({ className }: { className?: string }) {
  const value = useSyncExternalStore(subscribe, () => count, () => null) ?? 0;

  useEffect(() => {
    if (count !== null) return;
    const controller = new AbortController();
    fetch("/api/cart", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: unknown } | null) => {
        if (count === null && typeof data?.count === "number") setCartCount(data.count);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <Link
      href="/cart"
      className={className}
      aria-label={`Shopping bag, ${value} ${value === 1 ? "item" : "items"}`}
    >
      <BagIcon />
      {/* min-w + padding so two-digit counts stay inside the pill. */}
      <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[0.625rem] leading-none text-paper tabular-nums">
        {value > 99 ? "99+" : value}
      </span>
    </Link>
  );
}

/** Rendered by the cart page so the header matches the cart the server just priced. */
export function CartCountSync({ count: next }: { count: number }) {
  useEffect(() => setCartCount(next), [next]);
  return null;
}
