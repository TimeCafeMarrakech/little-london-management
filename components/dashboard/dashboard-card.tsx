import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardCard({ children, className }: DashboardCardProps) {
  return <section className={cn("rounded-lg border bg-card p-5 text-card-foreground shadow-soft", className)}>{children}</section>;
}
