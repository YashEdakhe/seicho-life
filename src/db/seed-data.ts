/*
 * Sample catalogue loaded by `npm run db:seed`. Photography: Unsplash (https://unsplash.com/license).
 * The database is the source of truth once seeded; pages never import this file.
 */

import { unsplash } from "../data/catalog";
import type { ColorOption, GalleryImage, SizeOption } from "../lib/catalog-types";

export type SeedCategory = {
  slug: string;
  name: string;
  image?: string;
  isFeatured: boolean;
};

export type SeedProduct = {
  slug: string;
  name: string;
  /** Category slug. */
  category: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  hoverImage?: string;
  gallery: GalleryImage[];
  colors: ColorOption[];
  sizes: SizeOption[];
  badge?: "new" | "bestseller";
  isNewArrival?: boolean;
  isBestseller?: boolean;
  description: string;
  details: string[];
  composition: string;
  care: string[];
};

// Array order is the display order.
export const categories: SeedCategory[] = [
  { slug: "shirts", name: "Shirts", image: unsplash("1620012253295-c15cc3e65df4", 900), isFeatured: true },
  { slug: "t-shirts", name: "T-Shirts", image: unsplash("1521572163474-6864f9cf17ab", 900), isFeatured: true },
  { slug: "trousers", name: "Trousers", image: unsplash("1473966968600-fa801b869a1a", 900), isFeatured: true },
  { slug: "denim", name: "Denim", image: unsplash("1604176354204-9268737828e4", 900), isFeatured: true },
  { slug: "outerwear", name: "Outerwear", image: unsplash("1552374196-1ab2a1c593e8", 900), isFeatured: true },
  { slug: "accessories", name: "Accessories", image: unsplash("1523275335684-37898b6baf30", 900), isFeatured: true },
  { slug: "knitwear", name: "Knitwear", isFeatured: false },
  { slug: "loungewear", name: "Loungewear", isFeatured: false },
];

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

type Crop = { x: number; y: number; zoom: number };

/** Close-up crop of an Unsplash photo using imgix focal-point zoom. */
function detailCrop(id: string, { x, y, zoom }: Crop) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}&w=1200&h=1600&q=80`;
}

const apparelSizes = (stock: number[]): SizeOption[] =>
  ["XS", "S", "M", "L", "XL"].map((label, i) => ({ label, stock: stock[i] ?? 0 }));
const waistSizes = (stock: number[]): SizeOption[] =>
  ["28", "30", "32", "34", "36"].map((label, i) => ({ label, stock: stock[i] ?? 0 }));
const oneSize = (stock: number): SizeOption[] => [{ label: "One size", stock }];

const cottonCare = [
  "Machine wash cold with similar colours",
  "Do not tumble dry; dry flat in shade",
  "Warm iron on the reverse",
];

type ProductInput = Omit<SeedProduct, "image" | "hoverImage" | "gallery"> & {
  photo: string;
  hoverPhoto?: string;
  /** Detail crops appended after the main image. */
  crops?: Crop[];
};

const defaultCrops: Crop[] = [
  { x: 0.5, y: 0.35, zoom: 2 },
  { x: 0.5, y: 0.7, zoom: 2.4 },
];

function defineProduct({ photo, hoverPhoto, crops = defaultCrops, ...rest }: ProductInput): SeedProduct {
  const gallery: GalleryImage[] = [
    { src: unsplash(photo, 1600), alt: `${rest.name}, full view` },
    ...crops.map((crop, i) => ({
      src: detailCrop(photo, crop),
      alt: `${rest.name}, close-up detail ${i + 1}`,
    })),
  ];
  if (hoverPhoto) {
    gallery.splice(1, 0, { src: unsplash(hoverPhoto, 1600), alt: `${rest.name}, styled` });
  }
  return {
    ...rest,
    image: unsplash(photo, 1000),
    hoverImage: hoverPhoto ? unsplash(hoverPhoto, 1000) : undefined,
    gallery,
  };
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

// Products are inserted in array order; new arrivals and bestsellers show in that order.
export const products: SeedProduct[] = [
  defineProduct({
    slug: "chambray-utility-shirt",
    name: "Chambray Utility Shirt",
    category: "shirts",
    price: 2890,
    photo: "1596755094514-f87e34085b2c",
    crops: [
      { x: 0.6, y: 0.55, zoom: 2.4 },
      { x: 0.3, y: 0.6, zoom: 2.6 },
    ],
    colors: [
      { name: "Indigo", hex: "#5b7896" },
      { name: "Ecru", hex: "#e8e4dc" },
    ],
    sizes: apparelSizes([4, 12, 18, 9, 0]),
    badge: "new",
    isNewArrival: true,
    description:
      "A soft, lightweight chambray shirt with a relaxed body and two flap pockets. Wear it buttoned on its own or open over a tee as a light layer.",
    details: [
      "Relaxed fit; true to size",
      "Spread collar and button cuffs",
      "Two chest flap pockets",
      "Curved hem, designed to be worn in or out",
    ],
    composition: "100% cotton chambray, 140 GSM",
    care: cottonCare,
  }),
  defineProduct({
    slug: "everyday-cotton-tee",
    name: "Everyday Cotton Tee",
    category: "t-shirts",
    price: 1290,
    photo: "1521572163474-6864f9cf17ab",
    crops: [
      { x: 0.5, y: 0.3, zoom: 2 },
      { x: 0.5, y: 0.6, zoom: 2.6 },
    ],
    colors: [
      { name: "Off White", hex: "#f4f2ee" },
      { name: "Black", hex: "#141414" },
      { name: "Olive", hex: "#6f7d63" },
    ],
    sizes: apparelSizes([10, 25, 30, 22, 14]),
    isNewArrival: true,
    description:
      "Our foundation tee in a dense, combed cotton jersey that keeps its shape wash after wash. A clean crew neck and a slightly dropped shoulder.",
    details: [
      "Regular fit",
      "Ribbed crew neck with taped shoulders",
      "Pre-washed to minimise shrinkage",
    ],
    composition: "100% combed cotton jersey, 180 GSM",
    care: cottonCare,
  }),
  defineProduct({
    slug: "tapered-cotton-chino",
    name: "Tapered Cotton Chino",
    category: "trousers",
    price: 3290,
    compareAtPrice: 3990,
    photo: "1473966968600-fa801b869a1a",
    colors: [
      { name: "Khaki", hex: "#b59f7b" },
      { name: "Navy", hex: "#2b2f36" },
    ],
    sizes: waistSizes([3, 8, 11, 6, 2]),
    isNewArrival: true,
    description:
      "A mid-rise chino tapered from the knee, cut from a brushed twill with a touch of stretch for all-day comfort.",
    details: [
      "Mid rise, tapered leg",
      "Zip fly with button closure",
      "Slant front pockets, welt back pockets",
      "Inside leg 30\" on size 32",
    ],
    composition: "98% cotton, 2% elastane twill",
    care: cottonCare,
  }),
  defineProduct({
    slug: "rinse-wash-straight-jean",
    name: "Rinse Wash Straight Jean",
    category: "denim",
    price: 3590,
    photo: "1624378439575-d8705ad7ae80",
    colors: [{ name: "Rinse", hex: "#1f2a3a" }],
    sizes: waistSizes([5, 14, 20, 12, 6]),
    badge: "bestseller",
    isNewArrival: true,
    description:
      "A straight-leg jean in a deep rinse wash that will fade to your own pattern over time. Rigid at first, softening with every wear.",
    details: [
      "Straight leg, regular rise",
      "Button fly",
      "Five-pocket styling with copper rivets",
    ],
    composition: "100% cotton denim, 13.5 oz",
    care: ["Wash inside out, cold, as rarely as you can", "Line dry", "Do not bleach"],
  }),
  defineProduct({
    slug: "washed-nylon-bomber",
    name: "Washed Nylon Bomber",
    category: "outerwear",
    price: 5490,
    photo: "1591047139829-d91aecb6caea",
    colors: [
      { name: "Rust", hex: "#b36a4c" },
      { name: "Moss", hex: "#3a3f2f" },
    ],
    sizes: apparelSizes([0, 2, 5, 4, 1]),
    badge: "new",
    isNewArrival: true,
    description:
      "A lightweight bomber in a garment-washed nylon with a soft, matte hand. Water-repellent and packable, for in-between weather.",
    details: [
      "Regular fit",
      "Ribbed collar, cuffs and hem",
      "Two-way front zip",
      "Side seam pockets and an interior zip pocket",
    ],
    composition: "Shell: 100% recycled nylon. Lining: 100% cotton",
    care: ["Machine wash cold on a gentle cycle", "Hang to dry", "Do not iron"],
  }),
  defineProduct({
    slug: "classic-leather-biker",
    name: "Classic Leather Biker",
    category: "outerwear",
    price: 12990,
    photo: "1520975916090-3105956dac38",
    crops: [
      { x: 0.5, y: 0.35, zoom: 2 },
      { x: 0.35, y: 0.55, zoom: 2.6 },
    ],
    colors: [{ name: "Black", hex: "#141414" }],
    sizes: apparelSizes([0, 0, 0, 0, 0]),
    isNewArrival: true,
    description:
      "An asymmetric biker jacket in supple, vegetable-tanned leather that softens and develops character with wear.",
    details: [
      "Slim fit; size up for layering",
      "Asymmetric zip front with notch lapels",
      "Zip cuffs and a buckled hem",
    ],
    composition: "100% lamb leather. Lining: 100% cotton",
    care: ["Specialist leather clean only", "Store on a padded hanger away from sunlight"],
  }),
  defineProduct({
    slug: "open-knit-cotton-poncho",
    name: "Open Knit Cotton Poncho",
    category: "knitwear",
    price: 3990,
    compareAtPrice: 4690,
    photo: "1434389677669-e08b4cac3105",
    crops: [
      { x: 0.5, y: 0.4, zoom: 2.4 },
      { x: 0.5, y: 0.85, zoom: 2.4 },
    ],
    colors: [{ name: "Natural", hex: "#ece3d2" }],
    sizes: [
      { label: "S/M", stock: 2 },
      { label: "M/L", stock: 1 },
    ],
    isNewArrival: true,
    description:
      "A hand-finished open-knit poncho in undyed cotton with a V-neck and fringed hem. An easy layer over a tee or slip dress.",
    details: ["Oversized fit", "V-neck", "Hand-knotted fringe hem"],
    composition: "100% organic cotton",
    care: ["Hand wash cold", "Dry flat; do not hang", "Do not wring"],
  }),
  defineProduct({
    slug: "relaxed-oxford-shirt",
    name: "Relaxed Oxford Shirt",
    category: "shirts",
    price: 2590,
    photo: "1602810318383-e386cc2a3ccf",
    hoverPhoto: "1620012253295-c15cc3e65df4",
    crops: [{ x: 0.45, y: 0.45, zoom: 2.2 }],
    colors: [
      { name: "Slate", hex: "#4a4f5c" },
      { name: "White", hex: "#f2efe8" },
      { name: "Burgundy", hex: "#6b2536" },
    ],
    sizes: apparelSizes([6, 14, 16, 12, 7]),
    isNewArrival: true,
    description:
      "A wardrobe staple in a soft oxford weave, cut with room through the body. Button-down collar and a box pleat at the back.",
    details: ["Relaxed fit", "Button-down collar", "Back box pleat and locker loop"],
    composition: "100% cotton oxford",
    care: cottonCare,
  }),
  defineProduct({
    slug: "garment-dyed-tee",
    name: "Garment-Dyed Tee",
    category: "t-shirts",
    price: 1490,
    photo: "1523381210434-271e8be1f52b",
    colors: [
      { name: "Sage", hex: "#5f7466" },
      { name: "Black", hex: "#141414" },
    ],
    sizes: apparelSizes([8, 20, 26, 18, 9]),
    badge: "bestseller",
    isBestseller: true,
    description:
      "Dyed after sewing for a softly lived-in colour that varies slightly from piece to piece. Heavyweight jersey with a boxy cut.",
    details: ["Boxy fit", "Dropped shoulder", "Each piece is slightly unique in tone"],
    composition: "100% cotton jersey, 220 GSM",
    care: cottonCare,
  }),
  defineProduct({
    slug: "soft-jersey-jogger",
    name: "Soft Jersey Jogger",
    category: "loungewear",
    price: 2190,
    photo: "1506629082955-511b1aa562c8",
    colors: [
      { name: "Dusk Blue", hex: "#7f9bb3" },
      { name: "Grey Marl", hex: "#8c8c8c" },
    ],
    sizes: apparelSizes([5, 10, 12, 8, 4]),
    isBestseller: true,
    description:
      "A brushed-back jersey jogger with an easy, relaxed leg. Made for weekends, travel and everything in between.",
    details: ["Relaxed fit", "Elasticated drawstring waist", "Side pockets and one back pocket"],
    composition: "80% cotton, 20% recycled polyester fleece-back jersey",
    care: cottonCare,
  }),
  defineProduct({
    slug: "canvas-day-backpack",
    name: "Canvas Day Backpack",
    category: "accessories",
    price: 3490,
    photo: "1553062407-98eeb64c6a62",
    colors: [{ name: "Navy", hex: "#1f2a3a" }],
    sizes: oneSize(24),
    isBestseller: true,
    description:
      "A structured everyday backpack in waxed canvas, with a padded sleeve that fits a 14-inch laptop.",
    details: ["18 L capacity", "Padded laptop sleeve", "Water-resistant waxed finish"],
    composition: "Waxed cotton canvas with leather trims",
    care: ["Spot clean with a damp cloth", "Re-wax once a year"],
  }),
  defineProduct({
    slug: "minimal-steel-watch",
    name: "Minimal Steel Watch",
    category: "accessories",
    price: 8990,
    compareAtPrice: 10490,
    photo: "1523275335684-37898b6baf30",
    crops: [{ x: 0.5, y: 0.5, zoom: 2.6 }],
    colors: [{ name: "White", hex: "#f2f2f2" }],
    sizes: oneSize(3),
    isBestseller: true,
    description:
      "A clean, 38 mm watch face on a soft silicone strap. Water-resistant to 50 m, with a two-year warranty.",
    details: ["38 mm case", "Japanese quartz movement", "Water-resistant to 5 ATM"],
    composition: "Stainless steel case, silicone strap",
    care: ["Wipe with a soft dry cloth", "Avoid exposure to perfume and solvents"],
  }),
  defineProduct({
    slug: "weekend-layering-set",
    name: "Weekend Layering Set",
    category: "knitwear",
    price: 4290,
    photo: "1556905055-8f358a7a47b2",
    colors: [
      { name: "Rust", hex: "#b45f3c" },
      { name: "Grey", hex: "#c9c9c9" },
    ],
    sizes: apparelSizes([2, 6, 9, 7, 3]),
    isBestseller: true,
    description:
      "A ribbed beanie and a soft crew-neck knit, gift-boxed together. The easiest cold-weather upgrade.",
    details: ["Includes one beanie and one sweater", "Regular fit sweater", "Gift boxed"],
    composition: "70% cotton, 30% wool",
    care: ["Hand wash cold", "Dry flat"],
  }),
  defineProduct({
    slug: "heavyweight-black-tee",
    name: "Heavyweight Black Tee",
    category: "t-shirts",
    price: 1590,
    photo: "1618354691373-d851c5c3a990",
    colors: [
      { name: "Black", hex: "#141414" },
      { name: "Off White", hex: "#f4f2ee" },
    ],
    sizes: apparelSizes([6, 18, 24, 20, 10]),
    badge: "bestseller",
    isBestseller: true,
    description:
      "A structured, heavyweight tee with a high crew neck. Holds its shape and gets better with every wash.",
    details: ["Regular fit", "High crew neck", "Double-stitched hems"],
    composition: "100% cotton jersey, 240 GSM",
    care: cottonCare,
  }),
];
