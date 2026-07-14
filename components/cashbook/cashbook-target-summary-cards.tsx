import { BarChart3, GraduationCap, LineChart, PiggyBank } from "lucide-react";

import type { CashbookTargetProgress, CashbookTargetType } from "@/features/cashbook/types";

import { formatTargetType, formatTargetValue, statusClass } from "./cashbook-target-utils";

type CashbookTargetSummaryCardsProps = {
  progressCards: CashbookTargetProgress[];
};

const targetOrder: CashbookTargetType[] = ["revenue", "profit", "expense_budget", "active_students"];

const iconMap = {
  revenue: LineChart,
  profit: PiggyBank,
  expense_budget: BarChart3,
  active_students: GraduationCap,
};

const emptyTargets: Record<CashbookTargetType, CashbookTargetProgress> = {
  revenue: emptyProgress("revenue"),
  profit: emptyProgress("profit"),
  expense_budget: emptyProgress("expense_budget"),
  active_students: emptyProgress("active_students"),
};

function emptyProgress(targetType: CashbookTargetType): CashbookTargetProgress {
  return {
    targetId: targetType,
    branchId: null,
    targetMonth: "",
    targetType,
    targetValue: 0,
    currentValue: 0,
    remainingValue: 0,
    percentageAchieved: 0,
    daysRemaining: 0,
    projectedMonthEndValue: 0,
    averageRequiredPerRemainingDay: 0,
    targetStatus: "No target",
    businessAreaId: null,
    businessAreaName: null,
  };
}

function progressWidth(progress: CashbookTargetProgress): number {
  if (progress.targetType === "expense_budget") {
    return Math.min(Math.max(progress.percentageAchieved, 0), 120);
  }

  return Math.min(Math.max(progress.percentageAchieved, 0), 100);
}

export function CashbookTargetSummaryCards({ progressCards }: CashbookTargetSummaryCardsProps) {
  const progressByType = new Map(progressCards.map((progress) => [progress.targetType, progress]));

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {targetOrder.map((targetType) => {
        const progress = progressByType.get(targetType) ?? emptyTargets[targetType];
        const Icon = iconMap[targetType];
        const hasTarget = progress.targetStatus !== "No target";
        const width = progressWidth(progress);

        return (
          <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]" key={targetType}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">{formatTargetType(targetType)} Target</p>
                <p className="mt-3 text-2xl font-bold text-[#0f2d47]">{hasTarget ? formatTargetValue(targetType, progress.targetValue) : "Not set"}</p>
              </div>
              <span className="rounded-2xl bg-[#e6f4ec] p-3 text-[#2f9f69]">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-[#5b6f82]">
              <div className="flex justify-between gap-3">
                <span>{targetType === "expense_budget" ? "Spent" : "Current"}</span>
                <strong className="text-[#0f2d47]">{formatTargetValue(targetType, progress.currentValue)}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>{targetType === "expense_budget" ? "Budget left" : "Remaining"}</span>
                <strong className="text-[#0f2d47]">{formatTargetValue(targetType, progress.remainingValue)}</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#fff2cf]">
                <div
                  aria-label={`${progress.percentageAchieved}% achieved`}
                  className={targetType === "expense_budget" && progress.percentageAchieved > 100 ? "h-full bg-[#f24a3a]" : "h-full bg-[#78bf91]"}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>{progress.percentageAchieved}% achieved</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(progress.targetStatus)}`}>{progress.targetStatus}</span>
              </div>
              <p>{progress.daysRemaining} days remaining</p>
              <p>Projected: <strong className="text-[#0f2d47]">{hasTarget ? formatTargetValue(targetType, progress.projectedMonthEndValue) : "Not set"}</strong></p>
              <p>Required/day: <strong className="text-[#0f2d47]">{hasTarget ? formatTargetValue(targetType, progress.averageRequiredPerRemainingDay) : "Not set"}</strong></p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
