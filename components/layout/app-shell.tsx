import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6">
        {children}
      </div>
    </main>
  );
}
