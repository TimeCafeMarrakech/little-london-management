import Link from "next/link";

import { Button } from "@/components/ui/button";

type CashbookEmptyStateProps = {
  canCreate: boolean;
};

export function CashbookEmptyState({ canCreate }: CashbookEmptyStateProps) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-[#eadfce] bg-[#fff8ee] p-8 text-center shadow-[0_18px_45px_rgba(15,45,71,0.06)]">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Daily Income</p>
      <h2 className="mt-3 text-2xl font-bold text-[#0f2d47]">No income records found</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5b6f82]">
        Income matching the current filters will appear here. Use this space only for money received outside the invoice system.
      </p>
      {canCreate ? (
        <Button asChild className="mt-5 rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]">
          <Link href="/cashbook/new">Record income</Link>
        </Button>
      ) : null}
    </section>
  );
}
