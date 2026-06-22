import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/lib/dashboard/data";

const toneClasses: Record<DashboardStat["tone"], string> = {
  navy: "bg-primary",
  sky: "bg-muted",
  orange: "bg-accent",
  neutral: "bg-secondary",
};

const glowClasses: Record<DashboardStat["tone"], string> = {
  navy: "bg-primary/10 text-primary",
  sky: "bg-muted text-primary",
  orange: "bg-accent/20 text-primary",
  neutral: "bg-secondary/25 text-primary",
};

type StatCardProps = {
  stat: DashboardStat;
};

export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="ll-card-premium group p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-premium">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", glowClasses[stat.tone])}>
          {stat.label}
        </div>
        <span className={cn("h-3 w-3 rounded-full shadow-inner-soft", toneClasses[stat.tone])} aria-hidden="true" />
      </div>
      <div className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{stat.helper}</p>
    </div>
  );
}
