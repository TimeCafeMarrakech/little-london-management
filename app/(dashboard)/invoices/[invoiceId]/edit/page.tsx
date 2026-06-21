import { notFound } from "next/navigation";

import { InvoiceForm } from "@/components/finance/invoice-form";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageFinance, getInvoiceDetail, listFinanceParents, listFinanceStudents } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type EditInvoicePageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const profile = await requireUserProfile();

  if (!canManageFinance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to edit invoices.</p>
      </section>
    );
  }

  const { invoiceId } = await params;
  const [invoice, parents, students] = await Promise.all([
    getInvoiceDetail(profile, invoiceId),
    listFinanceParents(profile),
    listFinanceStudents(profile),
  ]);

  if (!invoice) {
    notFound();
  }

  if (invoice.status !== "draft") {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Invoice is locked</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only draft invoices can be edited. Record payments or archive the invoice from the detail page.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Finance</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Edit draft invoice</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Draft invoice edits replace the item set atomically so totals remain consistent.
        </p>
      </section>
      <InvoiceForm invoice={invoice} parents={parents} students={students} />
    </div>
  );
}
