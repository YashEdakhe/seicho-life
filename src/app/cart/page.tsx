import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CartCountSync } from "@/components/cart/cart-count";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { BagIcon } from "@/components/icons";
import { ProductPrice } from "@/components/product/product-price";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCart } from "@/data/cart";
import { MAX_LINE_QTY, type CartLine } from "@/lib/cart-types";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
};

const FREE_SHIPPING_FROM = 999;

export default async function CartPage() {
  const cart = await getCart();
  const hasIssues = cart.lines.some((line) => line.issue);

  return (
    <Container size="wide" className="pt-4 pb-(--spacing-section-sm) lg:pt-6">
      <CartCountSync count={cart.count} />
      <Breadcrumbs className="mb-4 lg:mb-6" items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />

      <header className="mb-8 flex flex-col gap-3 md:mb-12">
        <p className="text-label text-muted">Shopping bag</p>
        <h1>
          Your bag
          {cart.count > 0 && (
            <span className="text-muted"> ({cart.count} {cart.count === 1 ? "item" : "items"})</span>
          )}
        </h1>
      </header>

      {cart.lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border-y border-line py-16 text-center">
          <BagIcon className="size-8 text-muted" />
          <h2 className="text-h3">Your bag is empty</h2>
          <p className="max-w-sm text-muted">
            Pieces you add will be saved here while you keep browsing.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/collections/new-in">Shop new in</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <section aria-label="Items in your bag">
            {hasIssues && (
              <p role="status" className="mb-4 text-sm text-warning">
                Some items changed since you added them. Please review your bag.
              </p>
            )}
            <ul className="divide-y divide-line border-y border-line">
              {cart.lines.map((line) => (
                <CartLineItem key={`${line.productId}-${line.size}`} line={line} />
              ))}
            </ul>
          </section>

          <aside
            aria-labelledby="bag-summary"
            className="flex flex-col gap-5 self-start border border-line p-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]"
          >
            <h2 id="bag-summary" className="text-label text-ink">
              Summary
            </h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink">Subtotal</dt>
                <dd className="price">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-right text-muted">
                  {cart.subtotal >= FREE_SHIPPING_FROM ? "Free" : "Calculated at checkout"}
                </dd>
              </div>
            </dl>
            <p className="text-meta">Inclusive of all taxes. Checkout is coming soon.</p>
            <ButtonLink href="/collections/new-in" variant="secondary" fullWidth>
              Continue shopping
            </ButtonLink>
          </aside>
        </div>
      )}
    </Container>
  );
}

/** The one stock message a line needs, most important first. */
function stockNote(line: CartLine) {
  if (line.issue === "unavailable") {
    return { tone: "text-danger", text: `No longer available in ${line.size}. Remove it to continue.` };
  }
  if (line.issue === "reduced") {
    return {
      tone: "text-warning",
      text: `Only ${line.maxQuantity} left in ${line.size}, so we've lowered your quantity.`,
    };
  }
  // Stock, not the per-size limit, is what stops the quantity going higher.
  const stockLimited = line.maxQuantity < MAX_LINE_QTY;
  if (stockLimited && (line.maxQuantity <= LOW_STOCK_THRESHOLD || line.quantity >= line.maxQuantity)) {
    return { tone: "text-warning", text: `Only ${line.maxQuantity} left in ${line.size}.` };
  }
  return null;
}

function CartLineItem({ line }: { line: CartLine }) {
  const unavailable = line.issue === "unavailable";
  const note = stockNote(line);
  return (
    <li className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
      <Link href={`/products/${line.slug}`} className="media-product block" tabIndex={-1} aria-hidden="true">
        <Image
          src={line.image}
          alt=""
          fill
          sizes="7rem"
          className={cn(unavailable && "opacity-50 grayscale")}
        />
        {unavailable && (
          <span className="badge badge-dark absolute top-1.5 left-1.5">Unavailable</span>
        )}
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-sm leading-snug tracking-normal">
              <Link href={`/products/${line.slug}`} className="hover:underline">
                {line.name}
              </Link>
            </h3>
            <p className="text-meta">Size: {line.size}</p>
            <ProductPrice price={line.price} compareAtPrice={line.compareAtPrice} />
          </div>
          {!unavailable && (
            <p className="price text-sm sm:text-right">
              {/* Visible on mobile, where the total sits under the unit price. */}
              <span className="text-meta sm:sr-only">Total </span>
              {formatPrice(line.lineTotal)}
            </p>
          )}
        </div>

        {note && <p className={cn("text-sm", note.tone)}>{note.text}</p>}

        <CartLineControls
          productId={line.productId}
          size={line.size}
          name={line.name}
          quantity={line.quantity}
          maxQuantity={line.maxQuantity}
          unavailable={unavailable}
        />
      </div>
    </li>
  );
}
