import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PaymentListItem } from "@/features/finance/types";

type PaymentCardProps = {
  payment: PaymentListItem;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">{payment.paymentNumber}</p>
          <h2 className="mt-2 text-xl font-semibold">{payment.parentName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{payment.studentName}</p>
        </div>
        <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold capitalize text-primary">
          {payment.paymentMethod.replace("_", " ")}
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
        <p>Amount: <span className="font-semibold text-foreground">{formatMoney(payment.amount)}</span></p>
        <p>Allocated: <span className="font-semibold text-foreground">{formatMoney(payment.allocatedAmount)}</span></p>
        <p>Date {payment.paymentDate}</p>
      </div>
      <Button asChild className="mt-5" size="sm">
        <Link href={`/payments/${payment.id}`}>View payment</Link>
      </Button>
    </article>
  );
}
