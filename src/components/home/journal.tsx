import Image from "next/image";
import Link from "next/link";
import { Container, Section, SectionHeader } from "@/components/ui/container";
import { stories } from "@/data/catalog";

export function Journal() {
  return (
    <Section>
      <Container size="wide">
        <SectionHeader
          eyebrow="The journal"
          title="Notes on dressing well"
          action={
            <Link href="/journal" className="text-label link-reveal self-start text-ink md:self-auto">
              Read more
            </Link>
          }
        />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-6">
          {stories.map((story) => (
            <li key={story.slug}>
              <Link href={`/journal/${story.slug}`} className="group flex flex-col gap-4">
                <div className="relative aspect-3/2 overflow-hidden bg-sand">
                  <Image
                    src={story.image}
                    alt=""
                    fill
                    sizes="(min-width: 48rem) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-label text-muted">{story.tag}</p>
                  <h3 className="group-hover:underline group-hover:underline-offset-4">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted">{story.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
