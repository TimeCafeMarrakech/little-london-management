import Link from "next/link";

import { Button } from "@/components/ui/button";

type ParentErrorStateProps = {
  title?: string;
  message: string;
};

export function ParentErrorState({ title = "Parent module is not ready yet", message }: ParentErrorStateProps) {
  return (
    <section className="rounded-lg border bg-card p-8 shadow-soft">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{message}</p>
      <Button asChild className="mt-6" variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </section>
  );
}
