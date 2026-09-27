import { Container } from "@/components/ui/container";
import { values } from "@/data/catalog";

/** Service promises row, divided by hairlines. */
export function BrandValues() {
  return (
    <section className="border-y border-line">
      <Container size="wide">
        <ul className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {values.map((value) => (
            <li key={value.title} className="flex flex-col gap-2 py-8 text-center md:px-8 md:py-12">
              <h3 className="text-label text-ink">{value.title}</h3>
              <p className="text-sm text-muted">{value.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
