import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";

import type { CashbookTargetProgress, CashbookTargetType } from "@/features/cashbook/types";

import { formatMoney, formatTargetType, formatTargetValue, statusClass } from "./cashbook-target-utils";

type CashbookPerformanceTargetsProps = {
  targets: CashbookTargetProgress[];
  revenueGoal: CashbookTargetProgress | null;
};

const targetOrder: CashbookTargetType[] = ["revenue", "profit", "expense_budget", "active_students"];

function progressWidth(progress: CashbookTargetProgress): number {
  if (progress.targetType === "expense_budget") {
    return Math.min(Math.max(progress.percentageAchieved, 0), 120);
  }

  return Math.min(Math.max(progress.percentageAchieved, 0), 100);
}

export function CashbookPerformanceTargets({ targets, revenueGoal }: CashbookPerformanceTargetsProps) {
  const targetsByType = new Map(targets.map((target) => [target.targetType, target]));
  const goalWidth = revenueGoal ? Math.min(Math.max(revenueGoal.percentageAchieved, 0), 100) : 0;

  return (
    <section className="grid gap-4 2xl:grid-cols-[0.44fr_0.56fr]">
        <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0f2d47]">Today&apos;s Revenue Goal</h2>
              <p className="mt-1 text-sm text-[#5b6f82]">Current-month revenue target</p>
            </div>
            <span className="rounded-full bg-[#e6f4ec] p-3 text-[#24734d]">
              <Target className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          {revenueGoal ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-[#5b6f82]">Monthly Revenue Target</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#0f2d47]">{formatMoney(revenueGoal.targetValue)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#f3eee6]">
                  <div className="h-full rounded-full bg-[#2f9f69]" style={{ width: `${goalWidth}%` }} />
                </div>
                <span className="text-sm font-semibold text-[#0f2d47]">{revenueGoal.percentageAchieved}%</span>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-[#fff8ee] p-3">
                  <p className="text-xs text-[#5b6f82]">Current Revenue</p>
                  <p className="mt-1 font-bold tabular-nums leading-6 text-[#0f2d47]">{formatMoney(revenueGoal.currentValue)}</p>
                </div>
                <div className="rounded-2xl bg-[#fff8ee] p-3">
                  <p className="text-xs text-[#5b6f82]">Remaining</p>
                  <p className="mt-1 font-bold tabular-nums leading-6 text-[#0f2d47]">{formatMoney(revenueGoal.remainingValue)}</p>
                </div>
                <div className="rounded-2xl bg-[#fff8ee] p-3">
                  <p className="text-xs text-[#5b6f82]">Days Remaining</p>
                  <p className="mt-1 font-bold tabular-nums leading-6 text-[#0f2d47]">{revenueGoal.daysRemaining}</p>
                </div>
                <div className="rounded-2xl bg-[#fff8ee] p-3">
                  <p className="text-xs text-[#5b6f82]">Required / Day</p>
                  <p className="mt-1 font-bold tabular-nums leading-6 text-[#0f2d47]">{formatMoney(revenueGoal.averageRequiredPerRemainingDay)}</p>
                </div>
                <div className="rounded-2xl bg-[#fff8ee] p-3">
                  <p className="text-xs text-[#5b6f82]">Projected Month-End</p>
                  <p className="mt-1 font-bold tabular-nums leading-6 text-[#0f2d47]">{formatMoney(revenueGoal.projectedMonthEndValue)}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(revenueGoal.targetStatus)}`}>{revenueGoal.targetStatus}</span>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-[#5b6f82]">No current-month revenue target is set yet. Create one in Monthly Targets to unlock this goal card.</p>
          )}
        </article>

        <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#0f2d47]">Monthly Targets</h2>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#f24a3a]" href="/cashbook/targets">
              View All Targets <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {targetOrder.map((type) => {
              const target = targetsByType.get(type);
              const width = target ? progressWidth(target) : 0;
              const status = target?.targetStatus ?? "No target";

              return (
                <div className="min-h-[12rem] rounded-[1.1rem] border border-[#eadfce] bg-[#fffaf4] p-4" key={type}>
                  <p className="text-sm font-bold text-[#0f2d47]">{formatTargetType(type)}</p>
                  <p className="mt-3 text-xl font-bold tabular-nums leading-7 text-[#0f2d47]">{target ? formatTargetValue(type, target.targetValue) : "Not set"}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f3eee6]">
                      <div className={type === "expense_budget" && (target?.percentageAchieved ?? 0) > 100 ? "h-full rounded-full bg-[#f24a3a]" : "h-full rounded-full bg-[#2f9f69]"} style={{ width: `${width}%` }} />
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-[#0f2d47]">{target ? `${target.percentageAchieved}%` : "0%"}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#5b6f82]">{type === "expense_budget" ? "Spent" : "Current"}</p>
                  <p className="mt-1 text-sm font-bold tabular-nums leading-5 text-[#0f2d47]">{target ? formatTargetValue(type, target.currentValue) : "0"}</p>
                  <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(status)}`}>{status}</span>
                </div>
              );
            })}
          </div>
        </article>
    </section>
  );
}
