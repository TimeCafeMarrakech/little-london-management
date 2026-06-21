import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { InvoiceListItem } from "@/features/finance/types";

type InvoiceCardProps = {
  invoice: InvoiceListItem;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">{invoice.invoiceNumber}</p>
          <h2 className="mt-2 text-xl font-semibold">{invoice.parentName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{invoice.studentName}</p>
        </div>
        <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold capitalize text-primary">
          {invoice.status.replace("_", " ")}
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
        <p>Total: <span className="font-semibold text-foreground">{formatMoney(invoice.total)}</span></p>
        <p>Paid: <span className="font-semibold text-foreground">{formatMoney(invoice.amountPaid)}</span></p>
        <p>Balance: <span className="font-semibold text-foreground">{formatMoney(invoice.balanceDue)}</span></p>
        <p>Due {invoice.dueDate}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={`/invoices/${invoice.id}`}>View invoice</Link>
        </Button>
        {invoice.status === "draft" ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/invoices/${invoice.id}/edit`}>Edit draft</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
