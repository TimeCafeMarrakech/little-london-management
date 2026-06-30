import { notFound } from "next/navigation";

import { ReceiptPdfActions } from "@/components/business-documents/receipt-pdf-actions";
import { requireUserProfile } from "@/lib/auth/session";
import { getReceiptEmail, getReceiptWhatsAppMessage } from "@/services/business-documents/messages";
import { canManageFinance, getPaymentDetail } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type PaymentDetailPageProps = {
  params: Promise<{ paymentId: string }>;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const profile = await requireUserProfile();

  if (!canManageFinance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to view payments.</p>
      </section>
    );
  }

  const { paymentId } = await params;
  const payment = await getPaymentDetail(profile, paymentId);

  if (!payment) {
    notFound();
  }

  const receiptEmail = getReceiptEmail(payment);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">{payment.paymentNumber}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{payment.parentName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{payment.studentName} - {payment.paymentDate}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Amount", formatMoney(payment.amount)],
          ["Allocated", formatMoney(payment.allocatedAmount)],
          ["Unallocated", formatMoney(Math.max(payment.amount - payment.allocatedAmount, 0))],
          ["Method", payment.paymentMethod.replace("_", " ")],
        ].map(([label, value]) => (
          <section className="rounded-lg border bg-card p-5 shadow-soft" key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold capitalize">{value}</p>
          </section>
        ))}
      </div>

      <ReceiptPdfActions
        emailBody={receiptEmail.body}
        emailSubject={receiptEmail.subject}
        paymentId={payment.id}
        paymentNumber={payment.paymentNumber}
        whatsAppMessage={getReceiptWhatsAppMessage(payment)}
      />

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Allocations</h2>
        <div className="mt-4 space-y-3">
          {payment.allocations.length > 0 ? payment.allocations.map((allocation) => (
            <article className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/45 p-4" key={allocation.id}>
              <p className="font-medium">{allocation.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(allocation.amountAllocated)}</p>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">This payment has not been allocated yet.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Notes</h2>
        <p className="mt-3 rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{payment.notes ?? "No notes recorded."}</p>
      </section>
    </div>
  );
}
