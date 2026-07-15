import { GraduationCap } from "lucide-react";
import Link from "next/link";

import type { CashbookStudentKpis } from "@/features/cashbook/types";

type CashbookStudentKpisProps = {
  kpis: CashbookStudentKpis;
};

export function CashbookStudentKpis({ kpis }: CashbookStudentKpisProps) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0f2d47]">Student KPIs</h2>
        </div>
        <span className="rounded-2xl bg-[#ddeaf5] p-3 text-[#0f2d47]">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[#5b6f82]">Active Students</span>
          <strong className="tabular-nums text-[#0f2d47]">{kpis.activeStudents}</strong>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#5b6f82]">New This Month</span>
          <strong className="tabular-nums text-[#0f2d47]">{kpis.newActiveStudentsThisMonth ?? "Deferred"}</strong>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#5b6f82]">Left This Month</span>
          <strong className="tabular-nums text-[#0f2d47]">{kpis.archivedOrInactiveThisMonth ?? 0}</strong>
        </div>
      </div>
      <Link className="mt-5 inline-flex text-sm font-bold text-[#f24a3a]" href="/students">View Students</Link>
    </article>
  );
}
