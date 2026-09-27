/*
 * Static storefront content for the homepage and site chrome. Products and categories
 * live in the database (see src/data/products.ts).
 * Photography: Unsplash (https://unsplash.com/license), served from images.unsplash.com.
 */

export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  image: string;
};

/** Build an Unsplash CDN URL; next/image resizes it further per breakpoint. */
export function unsplash(id: string, width = 1800) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const hero = {
  eyebrow: "Autumn / Winter 2026",
  title: "Quiet layers for the long season",
  description:
    "Natural fibres, considered cuts and a palette that works with everything you already own.",
  image: unsplash("1558769132-cb1aea458c5e", 2400),
  imageAlt: "Neutral knitwear and shirts hanging on a rail beside dried pampas grass",
  primaryCta: { label: "Shop the collection", href: "/collections/new-in" },
  secondaryCta: { label: "Explore the edit", href: "/collections/autumn-winter" },
};

export const featuredCollection = {
  eyebrow: "The tailoring edit",
  title: "Structure, softened",
  description:
    "Unlined blazers, fluid trousers and crisp poplin, cut for movement and made to be worn from morning meetings to late dinners.",
  image: unsplash("1507679799987-c73779587ccf", 1600),
  imageAlt: "A man in a navy suit adjusting his jacket button",
  detailImage: unsplash("1617137968427-85924c800a22", 1000),
  detailImageAlt: "A man in a blue suit walking past a glass building",
  cta: { label: "Shop tailoring", href: "/collections/tailoring" },
};

export const campaign = [
  {
    eyebrow: "Menswear",
    title: "Built to be worn in",
    href: "/collections/men",
    image: unsplash("1520975916090-3105956dac38", 1400),
    imageAlt: "A man in a black leather jacket sitting by a brick wall",
  },
  {
    eyebrow: "Womenswear",
    title: "Layers that travel",
    href: "/collections/women",
    image: unsplash("1539109136881-3be0616acf4b", 1400),
    imageAlt: "A woman in a pale blue coat outside a cathedral",
  },
];

export const values = [
  {
    title: "Free shipping over ₹999",
    description: "Delivered across India in 3–5 working days.",
  },
  {
    title: "Easy 15-day returns",
    description: "Changed your mind? Send it back, no questions asked.",
  },
  {
    title: "Natural fibres first",
    description: "Cotton, linen and wool, chosen to last seasons, not weeks.",
  },
];

export const stories: Story[] = [
  {
    slug: "how-to-build-a-capsule-wardrobe",
    tag: "Style notes",
    title: "Ten pieces, thirty outfits",
    excerpt: "A practical guide to building a wardrobe that grows with you.",
    image: unsplash("1490481651871-ab68de25d43d", 1200),
  },
  {
    slug: "caring-for-natural-fibres",
    tag: "Care",
    title: "Wash less, wear longer",
    excerpt: "Simple habits that keep cotton and linen looking their best.",
    image: unsplash("1512436991641-6745cdb1723f", 1200),
  },
  {
    slug: "inside-the-studio",
    tag: "Behind the seams",
    title: "Inside the studio",
    excerpt: "How a single shirt goes from sketch to shelf in eight weeks.",
    image: unsplash("1441984904996-e0b6ba687e04", 1200),
  },
];

export const navigation = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Collections", href: "/collections" },
  { label: "Journal", href: "/journal" },
];

export const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/collections/new-in" },
      { label: "Shirts", href: "/collections/shirts" },
      { label: "Trousers", href: "/collections/trousers" },
      { label: "Outerwear", href: "/collections/outerwear" },
      { label: "Accessories", href: "/collections/accessories" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track order", href: "/account/orders" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Returns & exchanges", href: "/help/returns" },
      { label: "Size guide", href: "/help/size-guide" },
      { label: "Contact us", href: "/help/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Careers", href: "/careers" },
      { label: "Stores", href: "/stores" },
    ],
  },
];
