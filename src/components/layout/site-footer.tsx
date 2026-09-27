import Link from "next/link";
import { InstagramIcon, PinterestIcon, YoutubeIcon } from "@/components/icons";
import { footerLinks } from "@/data/catalog";

const social = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
  { label: "Pinterest", href: "https://pinterest.com", Icon: PinterestIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="page-container-wide section-sm grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-sm flex-col gap-4">
          <Link href="/" className="font-display text-lg tracking-[0.28em] text-ink uppercase">
            Seicho<span className="text-muted"> Life</span>
          </Link>
          <p className="text-sm text-muted">
            Everyday clothing in natural fibres, designed in India to be worn, repaired and worn
            again.
          </p>
          <ul className="-ml-3 flex">
            {social.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="btn btn-ghost btn-icon"
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {footerLinks.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-label mb-4 text-ink">{group.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-reveal text-sm text-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="page-container-wide flex flex-col gap-3 py-5 text-meta sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Seicho Life. All rights reserved.</p>
          <ul className="flex gap-5">
            <li>
              <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
            </li>
            <li>
              <Link href="/legal/cookies" className="hover:text-ink">Cookies</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
