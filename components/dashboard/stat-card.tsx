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

const trendStrokeClasses: Record<DashboardStat["tone"], string> = {
  navy: "stroke-primary",
  sky: "stroke-secondary",
  orange: "stroke-accent",
  neutral: "stroke-primary/70",
};

type StatCardProps = {
  stat: DashboardStat;
};

function trendPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 120;
      const y = 36 - ((value - min) / range) * 28;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

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
      <div className="mt-5 rounded-lg bg-background/60 p-3 shadow-inner-soft">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-primary">{stat.trendLabel}</span>
          <span className="text-muted-foreground">7 day view</span>
        </div>
        <svg className="h-12 w-full overflow-visible" role="img" aria-label={`${stat.label} trend`} viewBox="0 0 120 44" preserveAspectRatio="none">
          <polyline
            className={cn("fill-none stroke-[3] drop-shadow-sm", trendStrokeClasses[stat.tone])}
            points={trendPoints(stat.trend)}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
