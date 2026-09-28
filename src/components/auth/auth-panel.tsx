import { Container, Section } from "@/components/ui/container";

type AuthPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

/** Centered narrow panel shared by the sign-in and sign-up pages. */
export function AuthPanel({ eyebrow, title, description, children, footer }: AuthPanelProps) {
  return (
    <Section>
      <Container size="narrow" className="flex max-w-md flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-label text-muted">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="text-ink-soft">{description}</p>
        </header>
        {children}
        <p className="border-t border-line pt-6 text-center text-sm text-muted">{footer}</p>
      </Container>
    </Section>
  );
}
