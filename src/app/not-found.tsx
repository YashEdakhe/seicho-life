import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Section>
      <Container size="narrow" className="flex flex-col items-center gap-5 text-center">
        <p className="text-label text-muted">Error 404</p>
        <h1>We couldn&apos;t find that page</h1>
        <p className="max-w-md text-muted">
          The piece you&apos;re looking for may have sold out or moved. Try the latest arrivals
          instead.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/collections/new-in" variant="secondary">
            Shop new in
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
