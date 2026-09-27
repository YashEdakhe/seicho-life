import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

type ProductPriceProps = {
  price: number;
  compareAtPrice?: number;
  /** `lg` is used on the product detail page. */
  size?: "sm" | "lg";
  className?: string;
};

export function discountPercent(price: number, compareAtPrice?: number) {
  if (compareAtPrice === undefined || compareAtPrice <= price) return 0;
  return Math.round((1 - price / compareAtPrice) * 100);
}

/** Current price, with the struck-through original when the product is on sale. */
export function ProductPrice({ price, compareAtPrice, size = "sm", className }: ProductPriceProps) {
  const onSale = discountPercent(price, compareAtPrice) > 0;
  const text = size === "lg" ? "text-lg" : undefined;

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("price", text, onSale && "price-sale")}>
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className={cn("price-compare", text)}>
          <span className="sr-only">Original price </span>
          {formatPrice(compareAtPrice!)}
        </span>
      )}
    </p>
  );
}
