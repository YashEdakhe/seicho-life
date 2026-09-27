/*
 * Client-safe catalogue types and stock helpers. Queries live in src/data/products.ts,
 * which is server-only; import from here in client components.
 */

export type ColorOption = { name: string; hex: string };
export type SizeOption = { label: string; stock: number };
export type GalleryImage = { src: string; alt: string };
export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export type Category = {
  slug: string;
  name: string;
  image: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  /** Card image; also the first gallery image. */
  image: string;
  /** Optional alternate shown on card hover. */
  hoverImage?: string;
  gallery: GalleryImage[];
  colors: ColorOption[];
  sizes: SizeOption[];
  badge?: "New" | "Bestseller";
  description: string;
  details: string[];
  composition: string;
  care: string[];
};

/** Stock at or below this per size is shown as "only N left". */
export const LOW_STOCK_THRESHOLD = 3;

export function getStockState(sizes: SizeOption[]): StockState {
  const total = sizes.reduce((sum, s) => sum + s.stock, 0);
  if (total === 0) return "out_of_stock";
  if (sizes.every((s) => s.stock <= LOW_STOCK_THRESHOLD)) return "low_stock";
  return "in_stock";
}
