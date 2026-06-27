import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/lib/dashboard/data";

const toneClasses: Record<DashboardStat["tone"], string> = {
  navy: "bg-[#0f2d47]",
  sky: "bg-[#8cc9a8]",
  orange: "bg-[#f24a3a]",
  neutral: "bg-[#8cc9a8]",
};

const glowClasses: Record<DashboardStat["tone"], string> = {
  navy: "bg-[#0f2d47]/10 text-[#0f2d47]",
  sky: "bg-[#8cc9a8]/20 text-[#0f2d47]",
  orange: "bg-[#f24a3a]/10 text-[#f24a3a]",
  neutral: "bg-[#8cc9a8]/20 text-[#0f2d47]",
};

const trendStrokeClasses: Record<DashboardStat["tone"], string> = {
  navy: "stroke-[#0f2d47]",
  sky: "stroke-[#8cc9a8]",
  orange: "stroke-[#f24a3a]",
  neutral: "stroke-[#d6b36a]",
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
    <div className="group rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_22px_55px_rgba(15,45,71,0.08)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,45,71,0.12)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", glowClasses[stat.tone])}>
          {stat.label}
        </div>
        <span className={cn("h-3 w-3 rounded-full shadow-inner-soft", toneClasses[stat.tone])} aria-hidden="true" />
      </div>
      <div className="text-3xl font-semibold tracking-tight text-[#0f2d47]">{stat.value}</div>
      <p className="mt-3 text-sm leading-6 text-[#5b6f82]">{stat.helper}</p>
      <div className="mt-5 rounded-2xl bg-[#fff8ee] p-3 shadow-inner-soft">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-[#0f2d47]">{stat.trendLabel}</span>
          <span className="text-[#5b6f82]">7 day view</span>
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
