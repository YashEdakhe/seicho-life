"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type NavItem = { label: string; href: string };

/** Slide-in navigation drawer for screens below the `lg` breakpoint. */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="btn btn-ghost btn-icon -ml-3"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav"
        aria-label="Main"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(22rem,85vw)] flex-col bg-paper shadow-lg transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-(--header-height) items-center justify-between border-b border-line px-(--spacing-gutter)">
          <span className="text-label text-muted">Menu</span>
          <button
            type="button"
            className="btn btn-ghost btn-icon -mr-3"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <ul className="flex flex-col px-(--spacing-gutter) py-4">
          {items.map((item) => (
            <li key={item.href} className="border-b border-line">
              <Link
                href={item.href}
                className="block py-4 font-display text-h3 text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3 border-t border-line p-(--spacing-gutter)">
          <Link href="/account" className="text-label text-ink" onClick={() => setOpen(false)}>
            Sign in / Register
          </Link>
          <Link href="/help/contact" className="text-label text-muted" onClick={() => setOpen(false)}>
            Help &amp; contact
          </Link>
        </div>
      </nav>
    </div>
  );
}
