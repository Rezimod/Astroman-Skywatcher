import type { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  className?: string;
}>;

export function SectionCard({ title, eyebrow, className = "", children }: SectionCardProps) {
  return (
    <section className={`card p-5 ${className}`}>
      {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.24em] text-text-muted">{eyebrow}</p> : null}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
