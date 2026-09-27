import { BrandValues } from "@/components/home/brand-values";
import { CampaignSplit } from "@/components/home/campaign-split";
import { CategoryTiles } from "@/components/home/category-tiles";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { Hero } from "@/components/home/hero";
import { Journal } from "@/components/home/journal";
import { Newsletter } from "@/components/home/newsletter";
import { ProductGridSection, ProductRailSection } from "@/components/home/product-sections";
import { getBestSellers, getFeaturedCategories, getNewArrivals } from "@/data/products";

// Re-query the catalogue (prices, stock) at most every 5 minutes.
export const revalidate = 300;

export default async function Home() {
  const [categories, newArrivals, bestSellers] = await Promise.all([
    getFeaturedCategories(),
    getNewArrivals(),
    getBestSellers(),
  ]);

  return (
    <>
      <Hero />
      <CategoryTiles categories={categories} />
      <ProductGridSection
        eyebrow="Just landed"
        title="New arrivals"
        href="/collections/new-in"
        products={newArrivals}
      />
      <FeaturedCollection />
      <ProductRailSection
        eyebrow="Most loved"
        title="Bestsellers"
        href="/collections/bestsellers"
        products={bestSellers}
      />
      <CampaignSplit />
      <BrandValues />
      <Journal />
      <Newsletter />
    </>
  );
}
