import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <section className={cn("rounded-[1.5rem] border border-white/80 bg-white/85 p-6 shadow-[0_22px_55px_rgba(15,45,71,0.08)] backdrop-blur", className)}>
      {children}
    </section>
  );
}
