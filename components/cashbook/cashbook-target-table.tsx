import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CashbookTargetListItem } from "@/features/cashbook/types";

import { formatTargetType, formatTargetValue, statusClass } from "./cashbook-target-utils";

type CashbookTargetTableProps = {
  targets: CashbookTargetListItem[];
  canManage: boolean;
};

export function CashbookTargetTable({ targets, canManage }: CashbookTargetTableProps) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white/92 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left text-sm text-[#0f2d47]">
          <thead className="bg-[#fff8ee] text-xs uppercase tracking-[0.14em] text-[#5b6f82]">
            <tr>
              <th className="px-5 py-4">Target Month</th>
              <th className="px-5 py-4">Target Type</th>
              <th className="px-5 py-4">Business Area</th>
              <th className="px-5 py-4">Target</th>
              <th className="px-5 py-4">Current</th>
              <th className="px-5 py-4">Remaining</th>
              <th className="px-5 py-4">Achieved</th>
              <th className="px-5 py-4">Days</th>
              <th className="px-5 py-4">Projected</th>
              <th className="px-5 py-4">Required / Day</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eadfce]">
            {targets.map((target) => (
              <tr className="align-top" key={target.id}>
                <td className="whitespace-nowrap px-5 py-4 font-semibold">{target.targetMonth}</td>
                <td className="px-5 py-4">{formatTargetType(target.targetType)}</td>
                <td className="px-5 py-4">{target.businessAreaName ?? "Whole business"}</td>
                <td className="whitespace-nowrap px-5 py-4 font-bold">{formatTargetValue(target.targetType, target.targetValue)}</td>
                <td className="whitespace-nowrap px-5 py-4">{formatTargetValue(target.targetType, target.currentValue)}</td>
                <td className="whitespace-nowrap px-5 py-4">{formatTargetValue(target.targetType, target.remainingValue)}</td>
                <td className="whitespace-nowrap px-5 py-4">{target.percentageAchieved}%</td>
                <td className="px-5 py-4">{target.daysRemaining}</td>
                <td className="whitespace-nowrap px-5 py-4">{formatTargetValue(target.targetType, target.projectedMonthEndValue)}</td>
                <td className="whitespace-nowrap px-5 py-4">{formatTargetValue(target.targetType, target.averageRequiredPerRemainingDay)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(target.targetStatus)}`}>{target.targetStatus}</span>
                  {target.status === "archived" ? <p className="mt-2 text-xs font-bold text-[#c53227]">Archived</p> : null}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-xl" size="sm" variant="outline">
                      <Link href={`/cashbook/targets/${target.id}`}>View</Link>
                    </Button>
                    {canManage && target.status === "active" && !target.deletedAt ? (
                      <Button asChild className="rounded-xl" size="sm">
                        <Link href={`/cashbook/targets/${target.id}/edit`}>Edit</Link>
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
