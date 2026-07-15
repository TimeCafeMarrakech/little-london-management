import { AlertCircle, Building2, ChartNoAxesCombined, Landmark, Sparkles, Target, Trophy } from "lucide-react";

import type { CashbookManagementInsight } from "@/features/cashbook/types";

type CashbookManagementInsightsProps = {
  insights: CashbookManagementInsight[];
};

const toneClass = {
  coral: "bg-[#ffe4df] text-[#f24a3a]",
  sage: "bg-[#e6f4ec] text-[#24734d]",
  yellow: "bg-[#fff2cf] text-[#a46f00]",
  navy: "bg-[#ddeaf5] text-[#0f2d47]",
};

const insightIcons = [Trophy, Landmark, ChartNoAxesCombined, AlertCircle, Target, Sparkles, Building2];

function splitInsight(detail: string): { value: string; supporting: string } {
  const match = detail.match(/([+-]?\d[\d,.]*\s?(?:MAD|%|invoice\(s\)|pts)?)/);

  if (!match) {
    return { value: "Review", supporting: detail };
  }

  return {
    value: match[1],
    supporting: detail.replace(match[1], "").trim(),
  };
}

export function CashbookManagementInsights({ insights }: CashbookManagementInsightsProps) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0f2d47]">Manager&apos;s Insights</h2>
        </div>
        <span className="rounded-2xl bg-[#fff2cf] p-3 text-[#a46f00]">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {insights.slice(0, 7).map((insight, index) => {
          const Icon = insightIcons[index] ?? Sparkles;
          const parsed = splitInsight(insight.detail);

          return (
          <div className="min-h-[8rem] border-r border-[#eadfce] pr-4 last:border-r-0" key={insight.title}>
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${toneClass[insight.tone]}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-xs font-semibold text-[#5b6f82]">{insight.title}</p>
            <p className="mt-1 text-base font-bold tabular-nums text-[#0f2d47]">{parsed.value}</p>
            <p className="mt-1 text-xs leading-5 text-[#5b6f82]">{parsed.supporting}</p>
          </div>
          );
        })}
      </div>
    </article>
  );
}
