import { InvoiceForm } from "@/components/finance/invoice-form";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageFinance, listFinanceParents, listFinanceStudents } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const profile = await requireUserProfile();

  if (!canManageFinance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to create invoices.</p>
      </section>
    );
  }

  const [parents, students] = await Promise.all([listFinanceParents(profile), listFinanceStudents(profile)]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Finance</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create invoice</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add invoice details and line items. Totals are calculated on the database side when saved.
        </p>
      </section>
      <InvoiceForm parents={parents} students={students} />
    </div>
  );
}
