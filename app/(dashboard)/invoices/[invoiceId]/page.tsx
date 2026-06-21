import Link from "next/link";
import { notFound } from "next/navigation";

import { InvoiceArchiveForm } from "@/components/finance/invoice-archive-form";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageFinance, getInvoiceDetail } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type InvoiceDetailPageProps = {
  params: Promise<{ invoiceId: string }>;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const profile = await requireUserProfile();

  if (!canManageFinance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to view invoices.</p>
      </section>
    );
  }

  const { invoiceId } = await params;
  const invoice = await getInvoiceDetail(profile, invoiceId);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{invoice.invoiceNumber}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{invoice.parentName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{invoice.studentName} - due {invoice.dueDate}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {invoice.status === "draft" ? <Button asChild variant="outline"><Link href={`/invoices/${invoice.id}/edit`}>Edit draft</Link></Button> : null}
            <InvoiceArchiveForm invoiceId={invoice.id} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total", formatMoney(invoice.total)],
          ["Paid", formatMoney(invoice.amountPaid)],
          ["Balance", formatMoney(invoice.balanceDue)],
          ["Status", invoice.status.replace("_", " ")],
        ].map(([label, value]) => (
          <section className="rounded-lg border bg-card p-5 shadow-soft" key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold capitalize">{value}</p>
          </section>
        ))}
      </div>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Invoice items</h2>
        <div className="mt-4 space-y-3">
          {invoice.items.map((item) => (
            <article className="grid gap-2 rounded-md bg-muted/45 p-4 md:grid-cols-[1fr_120px_150px_150px]" key={item.id}>
              <p className="font-medium">{item.description}</p>
              <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(item.unitPrice)}</p>
              <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Payment allocations</h2>
        <div className="mt-4 space-y-3">
          {invoice.payments.length > 0 ? invoice.payments.map((payment) => (
            <article className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/45 p-4" key={payment.id}>
              <p className="font-medium">{payment.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(payment.amountAllocated)}</p>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No payments allocated yet.</p>}
        </div>
      </section>
    </div>
  );
}
