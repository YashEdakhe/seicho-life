import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { requireUser } from "@/lib/session";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

const joined = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

export default async function AccountPage() {
  const { user } = await requireUser("/account");

  return (
    <Container size="narrow" className="pt-4 pb-(--spacing-section-sm) lg:pt-6">
      <Breadcrumbs className="mb-4 lg:mb-6" items={[{ label: "Home", href: "/" }, { label: "Account" }]} />

      <header className="mb-8 flex flex-col gap-3 md:mb-12">
        <p className="text-label text-muted">Your account</p>
        <h1>Hello, {user.name}</h1>
      </header>

      <dl className="divide-y divide-line border-y border-line text-sm">
        <div className="flex justify-between gap-4 py-5">
          <dt className="text-label text-ink">Name</dt>
          <dd className="text-right text-ink-soft">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4 py-5">
          <dt className="text-label text-ink">Email</dt>
          <dd className="text-right break-all text-ink-soft">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 py-5">
          <dt className="text-label text-ink">Member since</dt>
          <dd className="text-right text-ink-soft">{joined.format(user.createdAt)}</dd>
        </div>
      </dl>

      <form action={signOut} className="mt-8">
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </Container>
  );
}
