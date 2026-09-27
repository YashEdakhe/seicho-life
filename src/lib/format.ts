const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a whole-rupee amount, e.g. 2890 → "₹2,890". */
export function formatPrice(amount: number) {
  return inr.format(amount);
}
