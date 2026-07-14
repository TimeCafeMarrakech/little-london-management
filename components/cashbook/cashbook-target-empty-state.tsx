import Link from "next/link";

import { Button } from "@/components/ui/button";

type CashbookTargetEmptyStateProps = {
  canManage: boolean;
};

export function CashbookTargetEmptyState({ canManage }: CashbookTargetEmptyStateProps) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-[#eadfce] bg-white/86 p-8 text-center shadow-[0_16px_36px_rgba(15,45,71,0.06)]">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Monthly Targets</p>
      <h2 className="mt-2 text-2xl font-bold text-[#0f2d47]">No targets found</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#5b6f82]">
        Create a revenue, profit, expense budget, or active-students target to start tracking monthly performance.
      </p>
      {canManage ? (
        <Button asChild className="mt-5 rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]">
          <Link href="/cashbook/targets/new">Create Target</Link>
        </Button>
      ) : null}
    </section>
  );
}
