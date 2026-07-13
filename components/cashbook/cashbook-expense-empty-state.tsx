import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";

type CashbookExpenseEmptyStateProps = {
  canCreate: boolean;
};

export function CashbookExpenseEmptyState({ canCreate }: CashbookExpenseEmptyStateProps) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-[#eadfce] bg-[#fff8ee] p-8 text-center shadow-[0_18px_45px_rgba(15,45,71,0.06)]">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f24a3a]/10 text-[#f24a3a]">
        <ReceiptText className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-[#0f2d47]">No expenses found</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5b6f82]">
        Daily expenses will appear here once management records them.
      </p>
      {canCreate ? (
        <Button asChild className="mt-5 rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]">
          <Link href="/cashbook/expenses/new">Record Expense</Link>
        </Button>
      ) : null}
    </section>
  );
}
