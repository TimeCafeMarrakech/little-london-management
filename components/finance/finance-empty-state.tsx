import Link from "next/link";

import { Button } from "@/components/ui/button";

type FinanceEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function FinanceEmptyState({ title, description, actionHref, actionLabel }: FinanceEmptyStateProps) {
  return (
    <section className="rounded-lg border bg-card p-8 text-center shadow-soft">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </section>
  );
}
