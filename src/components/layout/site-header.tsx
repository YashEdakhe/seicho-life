import Link from "next/link";
import { BagIcon, SearchIcon, UserIcon } from "@/components/icons";
import { navigation } from "@/data/catalog";
import { MobileNav } from "./mobile-nav";

const iconLink = "btn btn-ghost btn-icon";

/**
 * Three-column header: navigation | centered wordmark | utilities.
 * On mobile the navigation collapses into a drawer on the left.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="page-container-wide grid h-(--header-height) grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center">
          <MobileNav items={navigation} />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-label link-reveal text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Link
          href="/"
          className="font-display text-lg tracking-[0.28em] text-ink uppercase lg:text-xl"
        >
          Seicho<span className="text-muted"> Life</span>
        </Link>

        <div className="flex items-center justify-end">
          <Link href="/search" className={iconLink} aria-label="Search">
            <SearchIcon />
          </Link>
          <Link href="/account" className={`${iconLink} hidden sm:inline-flex`} aria-label="Account">
            <UserIcon />
          </Link>
          <Link href="/cart" className={`${iconLink} relative`} aria-label="Shopping bag, 0 items">
            <BagIcon />
            <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-ink text-[0.625rem] leading-none text-paper">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
