import Link from "next/link";
import { notFound } from "next/navigation";

import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { CashbookTargetActions } from "@/components/cashbook/cashbook-target-actions";
import { formatTargetType, formatTargetValue, statusClass } from "@/components/cashbook/cashbook-target-utils";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canManageBusinessTargets,
  canViewBusinessTargets,
  getCashbookTargetDetail,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type CashbookTargetDetailPageProps = {
  params: Promise<{ targetId: string }>;
};

export default async function CashbookTargetDetailPage({ params }: CashbookTargetDetailPageProps) {
  const profile = await requireUserProfile();

  if (!canViewBusinessTargets(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to view monthly targets." />;
  }

  const { targetId } = await params;
  const target = await getCashbookTargetDetail(profile, targetId);

  if (!target) {
    notFound();
  }

  const canManage = canManageBusinessTargets(profile);
  const fields = [
    ["Target Month", target.targetMonth],
    ["Target Type", formatTargetType(target.targetType)],
    ["Business Area", target.businessAreaName ?? "Whole business"],
    ["Target Value", formatTargetValue(target.targetType, target.targetValue)],
    ["Current Value", formatTargetValue(target.targetType, target.currentValue)],
    ["Remaining", formatTargetValue(target.targetType, target.remainingValue)],
    ["Percentage Achieved", `${target.percentageAchieved}%`],
    ["Days Remaining", String(target.daysRemaining)],
    ["Projected Month-End", formatTargetValue(target.targetType, target.projectedMonthEndValue)],
    ["Average Required Per Remaining Day", formatTargetValue(target.targetType, target.averageRequiredPerRemainingDay)],
    ["Record Status", target.status],
  ];

  return (
    <div className="space-y-6">
      <CashbookTabs active="targets" />
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Monthly Target</p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">{formatTargetType(target.targetType)} Target</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(target.targetStatus)}`}>{target.targetStatus}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5b6f82]">{target.businessAreaName ?? "Whole business"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href="/cashbook/targets">Back to targets</Link>
            </Button>
            {canManage && target.status === "active" && !target.deletedAt ? (
              <Button asChild className="rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]">
                <Link href={`/cashbook/targets/${target.id}/edit`}>Edit</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map(([label, value]) => (
          <article className="rounded-[1.25rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_32px_rgba(15,45,71,0.07)]" key={label}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">{label}</p>
            <p className="mt-2 text-lg font-semibold text-[#0f2d47]">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-lg font-bold text-[#0f2d47]">Notes</h2>
        <p className="mt-3 rounded-2xl bg-[#fff8ee] px-4 py-3 text-sm text-[#5b6f82]">{target.notes ?? "No notes recorded."}</p>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-lg font-bold text-[#0f2d47]">Audit history</h2>
        <div className="mt-4 grid gap-3 text-sm text-[#5b6f82] md:grid-cols-2">
          <p>Created at: <span className="font-semibold text-[#0f2d47]">{target.createdAt}</span></p>
          <p>Updated at: <span className="font-semibold text-[#0f2d47]">{target.updatedAt}</span></p>
          <p>Created by: <span className="font-semibold text-[#0f2d47]">{target.createdBy ?? "Not recorded"}</span></p>
          <p>Updated by: <span className="font-semibold text-[#0f2d47]">{target.updatedBy ?? "Not recorded"}</span></p>
          <p>Archived at: <span className="font-semibold text-[#0f2d47]">{target.deletedAt ?? "Not archived"}</span></p>
          <p>Archived by: <span className="font-semibold text-[#0f2d47]">{target.deletedBy ?? "Not archived"}</span></p>
        </div>
      </section>

      <CashbookTargetActions canManage={canManage} status={target.status} targetId={target.id} />
    </div>
  );
}
