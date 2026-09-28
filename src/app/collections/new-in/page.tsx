import type { Metadata } from "next";
import { CollectionListing } from "@/components/product/collection-listing";
import { getLatestArrivals } from "@/data/products";

// Same freshness as the homepage and product pages: prices and stock refresh every 5 minutes.
export const revalidate = 300;

const description =
  "The latest pieces to land in the studio: natural fibres, considered cuts and easy layers for the season.";

export const metadata: Metadata = {
  title: "New arrivals",
  description,
  openGraph: { title: "New arrivals", description },
};

export default async function NewInPage() {
  return (
    <CollectionListing
      eyebrow="Just landed"
      title="New arrivals"
      description={description}
      products={await getLatestArrivals()}
    />
  );
}
