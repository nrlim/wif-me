import type { ReactElement } from "react";

type DashboardPageHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
};

export function DashboardPageHeader({ eyebrow, title, description }: DashboardPageHeaderProps): ReactElement {
  return (
    <section className="hidden max-w-3xl md:block">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{title}</h1>
      {description ? <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{description}</p> : null}
    </section>
  );
}
