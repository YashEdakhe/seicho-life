"use client";

import { useState, useTransition } from "react";
import { removeCartItem, updateCartItem } from "@/app/cart/actions";
import { MAX_LINE_QTY, type CartActionResult } from "@/lib/cart-types";
import { cn } from "@/lib/cn";
import { setCartCount } from "./cart-count";

type CartLineControlsProps = {
  productId: number;
  size: string;
  name: string;
  quantity: number;
  maxQuantity: number;
  unavailable: boolean;
};

const stepper =
  "grid size-10 place-items-center text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent";

/** Quantity stepper and remove button. The server checks stock; this only sends intent. */
export function CartLineControls({
  productId,
  size,
  name,
  quantity,
  maxQuantity,
  unavailable,
}: CartLineControlsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<CartActionResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) setCartCount(result.count);
        else setError(result.error);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  const label = `${name}, size ${size}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        {!unavailable && (
          <div
            role="group"
            aria-label={`Quantity for ${label}`}
            className={cn("inline-flex items-center border border-line-strong", pending && "opacity-60")}
          >
            <button
              type="button"
              className={stepper}
              aria-label="Decrease quantity"
              disabled={pending || quantity <= 1}
              onClick={() => run(() => updateCartItem(productId, size, quantity - 1))}
            >
              <span aria-hidden="true">−</span>
            </button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className={stepper}
              aria-label="Increase quantity"
              disabled={pending || quantity >= maxQuantity}
              onClick={() => run(() => updateCartItem(productId, size, quantity + 1))}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        )}
        <button
          type="button"
          className="link text-meta"
          disabled={pending}
          onClick={() => run(() => removeCartItem(productId, size))}
          aria-label={`Remove ${label}`}
        >
          Remove
        </button>
      </div>
      <p className="min-h-5 text-meta" aria-live="polite">
        {error ? (
          <span className="text-danger">{error}</span>
        ) : !unavailable && maxQuantity === MAX_LINE_QTY && quantity >= maxQuantity ? (
          // Stock limits are explained by the line's stock note; this is the per-size cap.
          <span>Limit of {MAX_LINE_QTY} per size.</span>
        ) : null}
      </p>
    </div>
  );
}
