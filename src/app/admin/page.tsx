import { count, lte } from "drizzle-orm";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { db } from "@/db";
import { categories, products, productStock } from "@/db/schema";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog-types";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminPage() {
  const { user } = await requireAdmin();

  const [[productCount], [categoryCount], [lowStockCount]] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(categories),
    db.select({ n: count() }).from(productStock).where(lte(productStock.quantity, LOW_STOCK_THRESHOLD)),
  ]);

  const stats = [
    { label: "Products", value: productCount.n },
    { label: "Categories", value: categoryCount.n },
    { label: `Sizes with ${LOW_STOCK_THRESHOLD} or fewer left`, value: lowStockCount.n },
  ];

  return (
    <Container size="wide" className="pt-4 pb-(--spacing-section-sm) lg:pt-6">
      <Breadcrumbs className="mb-4 lg:mb-6" items={[{ label: "Home", href: "/" }, { label: "Admin" }]} />

      <header className="mb-8 flex flex-col gap-3 md:mb-12">
        <p className="text-label break-all text-muted">Signed in as {user.email}</p>
        <h1>Admin</h1>
      </header>

      <dl className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2 border border-line p-6">
            <dt className="text-label text-muted">{stat.label}</dt>
            <dd className="text-h2 font-display tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
