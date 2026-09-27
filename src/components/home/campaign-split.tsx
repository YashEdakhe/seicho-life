import Image from "next/image";
import Link from "next/link";
import { campaign } from "@/data/catalog";

/** Two edge-to-edge image panels, stacked on mobile and side by side from `md`. */
export function CampaignSplit() {
  return (
    <section className="grid gap-px bg-line md:grid-cols-2">
      {campaign.map((panel) => (
        <Link
          key={panel.href}
          href={panel.href}
          className="group relative isolate flex aspect-4/5 items-end overflow-hidden bg-sand text-paper md:aspect-5/6"
        >
          <Image
            src={panel.image}
            alt={panel.imageAlt}
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="-z-10 object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
          <div className="flex flex-col items-start gap-3 p-(--spacing-gutter) pb-10 md:pb-12">
            <p className="text-label text-paper/85">{panel.eyebrow}</p>
            <h2 className="text-h1 leading-(--text-h1--line-height) text-paper">{panel.title}</h2>
            <span className="btn btn-inverse mt-2">Discover</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
