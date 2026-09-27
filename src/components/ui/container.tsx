import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

const widths = {
  narrow: "page-container-narrow",
  content: "page-container",
  wide: "page-container-wide",
} as const;

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: keyof typeof widths;
} & ComponentPropsWithoutRef<T>;

/** Centered page column with responsive gutters. */
export function Container<T extends ElementType = "div">({
  as,
  size = "content",
  className,
  ...props
}: ContainerProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={cn(widths[size], className)} {...props} />;
}

type SectionProps = {
  spacing?: "default" | "sm" | "none";
  tone?: "paper" | "canvas" | "ink";
} & ComponentPropsWithoutRef<"section">;

const tones = {
  paper: "bg-paper",
  canvas: "bg-canvas",
  ink: "bg-ink text-paper [&_:is(h1,h2,h3,h4)]:text-paper",
} as const;

/** Page section with consistent vertical rhythm and optional background tone. */
export function Section({
  spacing = "default",
  tone = "paper",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        spacing === "default" && "section",
        spacing === "sm" && "section-sm",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
};

/** Eyebrow + heading row, with an optional "view all" style action on the right. */
export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        {eyebrow && <p className="text-label text-muted">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
