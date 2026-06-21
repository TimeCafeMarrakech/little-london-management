import { PaymentForm } from "@/components/finance/payment-form";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canManageFinance,
  listFinanceParents,
  listFinanceStudents,
  listOutstandingInvoiceOptions,
} from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage() {
  const profile = await requireUserProfile();

  if (!canManageFinance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to record payments.</p>
      </section>
    );
  }

  const [parents, students, invoices] = await Promise.all([
    listFinanceParents(profile),
    listFinanceStudents(profile),
    listOutstandingInvoiceOptions(profile),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Finance</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Record payment</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Record a payment and optionally allocate it to issued invoices. Allocation consistency is enforced by Supabase.
        </p>
      </section>
      <PaymentForm invoices={invoices} parents={parents} students={students} />
    </div>
  );
}
