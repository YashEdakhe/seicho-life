import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionListing } from "@/components/product/collection-listing";
import { getCategory, getCategoryProducts, getCategorySlugs } from "@/data/products";

// Re-query products and stock at most every 5 minutes. Categories added after the build
// render on first request; unknown slugs 404 via notFound().
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getCategorySlugs()).map((slug) => ({ slug }));
}

function describe(name: string) {
  return `Shop ${name.toLowerCase()} in natural fibres and considered cuts, made to be worn season after season.`;
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return {};
  const description = describe(category.name);
  return {
    title: category.name,
    description,
    openGraph: { title: category.name, description },
  };
}

export default async function CategoryPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <CollectionListing
      eyebrow="Shop by category"
      title={category.name}
      description={describe(category.name)}
      products={await getCategoryProducts(slug)}
    />
  );
}
