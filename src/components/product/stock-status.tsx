import type { StockState } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";

const copy: Record<StockState, { label: string; dot: string }> = {
  in_stock: { label: "In stock, ready to ship", dot: "bg-success" },
  low_stock: { label: "Low stock", dot: "bg-warning" },
  out_of_stock: { label: "Out of stock", dot: "bg-subtle" },
};

type StockStatusProps = {
  state: StockState;
  /** Extra context, e.g. "only 2 left in M". */
  detail?: string;
  className?: string;
};

export function StockStatus({ state, detail, className }: StockStatusProps) {
  const { label, dot } = copy[state];
  return (
    <p className={cn("flex items-center gap-2 text-sm text-ink", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden="true" />
      <span>
        {label}
        {detail && <span className="text-muted">: {detail}</span>}
      </span>
    </p>
  );
}
