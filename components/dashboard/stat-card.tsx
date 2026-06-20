import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/lib/dashboard/data";

const toneClasses: Record<DashboardStat["tone"], string> = {
  navy: "bg-primary text-primary-foreground",
  sky: "bg-secondary/35 text-primary",
  orange: "bg-accent/25 text-primary",
  neutral: "bg-muted text-foreground",
};

type StatCardProps = {
  stat: DashboardStat;
};

export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-soft">
      <div className={cn("mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold", toneClasses[stat.tone])}>
        {stat.label}
      </div>
      <div className="text-3xl font-semibold tracking-normal text-foreground">{stat.value}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.helper}</p>
    </div>
  );
}
