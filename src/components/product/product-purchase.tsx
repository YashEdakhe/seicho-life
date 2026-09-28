"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { setCartCount } from "@/components/cart/cart-count";
import { Button } from "@/components/ui/button";
import { LOW_STOCK_THRESHOLD, type ColorOption, type SizeOption } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";

type ProductPurchaseProps = {
  productId: number;
  colors: ColorOption[];
  sizes: SizeOption[];
};

/**
 * Colour + size selection and the add-to-bag action. The server re-checks stock on add,
 * since `sizes` may be up to 5 minutes old. Colour is display-only and isn't sent.
 */
export function ProductPurchase({ productId, colors, sizes }: ProductPurchaseProps) {
  const id = useId();
  const singleSize = sizes.length === 1;
  const soldOut = sizes.every((s) => s.stock === 0);

  const [color, setColor] = useState(colors[0]?.name);
  const [size, setSize] = useState<string | null>(
    singleSize && sizes[0].stock > 0 ? sizes[0].label : null,
  );
  const [status, setStatus] = useState<"idle" | "needs-size" | "added" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedSize = sizes.find((s) => s.label === size);

  function addToBag() {
    if (!size) {
      setStatus("needs-size");
      return;
    }
    startTransition(async () => {
      try {
        const result = await addToCart(productId, size, 1);
        if (result.ok) {
          setCartCount(result.count);
          setStatus("added");
          setMessage(result.message ?? "Added to bag.");
        } else {
          setStatus("error");
          setMessage(result.error);
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {colors.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-label mb-3 text-ink">
            Colour: <span className="font-sans tracking-normal text-muted normal-case">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <label key={c.name} className="relative cursor-pointer" title={c.name}>
                <input
                  type="radio"
                  name={`${id}-color`}
                  value={c.name}
                  checked={color === c.name}
                  onChange={() => setColor(c.name)}
                  className="peer sr-only"
                />
                <span className="sr-only">{c.name}</span>
                <span
                  className="block size-8 rounded-full ring-1 ring-line-strong ring-offset-2 ring-offset-paper peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-focus"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden="true"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!singleSize && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p id={`${id}-size-label`} className="text-label text-ink">
              Size
              {size && (
                <span className="font-sans tracking-normal text-muted normal-case">: {size}</span>
              )}
            </p>
            <Link href="/help/size-guide" className="link text-meta">
              Size guide
            </Link>
          </div>
          <div
            role="radiogroup"
            aria-labelledby={`${id}-size-label`}
            aria-describedby={`${id}-size-msg`}
            className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
            {sizes.map((s) => {
              const unavailable = s.stock === 0;
              return (
                <label key={s.label} className={cn(unavailable ? "cursor-not-allowed" : "cursor-pointer")}>
                  <input
                    type="radio"
                    name={`${id}-size`}
                    value={s.label}
                    checked={size === s.label}
                    disabled={unavailable}
                    onChange={() => {
                      setSize(s.label);
                      setStatus("idle");
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-11 items-center justify-center border text-sm transition-colors",
                      "border-line-strong text-ink hover:border-ink",
                      "peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper",
                      "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                      "peer-disabled:border-line peer-disabled:text-subtle peer-disabled:line-through peer-disabled:hover:border-line",
                    )}
                  >
                    {s.label}
                    {unavailable && <span className="sr-only"> (sold out)</span>}
                  </span>
                </label>
              );
            })}
          </div>
          <p id={`${id}-size-msg`} className="mt-2 min-h-5 text-meta" aria-live="polite">
            {status === "needs-size" ? (
              <span className="text-danger">Please select a size.</span>
            ) : selectedSize && selectedSize.stock <= LOW_STOCK_THRESHOLD ? (
              <span className="text-warning">
                Only {selectedSize.stock} left in {selectedSize.label}.
              </span>
            ) : null}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {soldOut ? (
          <>
            <Button size="lg" fullWidth disabled>
              Sold out
            </Button>
            <p className="text-sm text-muted">
              This piece is currently unavailable. We restock our core styles regularly, so check
              back soon.
            </p>
          </>
        ) : (
          <Button size="lg" fullWidth onClick={addToBag} disabled={pending} aria-busy={pending}>
            {pending ? "Adding…" : size ? "Add to bag" : "Select a size"}
          </Button>
        )}
        <p role="status" className={cn("min-h-5 text-sm", status === "error" ? "text-danger" : "text-success")}>
          {status === "added" && (
            <>
              {message}{" "}
              <Link href="/cart" className="link text-ink">
                View bag
              </Link>
            </>
          )}
          {status === "error" && message}
        </p>
      </div>
    </div>
  );
}
