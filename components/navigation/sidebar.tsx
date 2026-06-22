import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { roleLabels, roleNavigation } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type SidebarProps = {
  profile: UserProfile;
};

export function Sidebar({ profile }: SidebarProps) {
  const navigation = roleNavigation[profile.role];

  return (
    <aside className="hidden h-screen max-h-screen w-72 overflow-hidden border-r bg-card/80 px-5 py-6 shadow-soft backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:block">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
            LL
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Little London</p>
            <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
          </div>
        </div>

        <nav className="mt-8 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                aria-disabled={item.disabled}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition",
                  item.active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted",
                  item.disabled && "cursor-not-allowed opacity-65",
                )}
                href={item.disabled || !item.href ? "#" : item.href}
                key={item.label}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md",
                    item.active ? "bg-white/15" : "bg-background text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={cn("block truncate text-xs", item.active ? "text-primary-foreground/75" : "text-muted-foreground")}>
                    {item.description}
                  </span>
                </span>
                {item.active ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 shrink-0 rounded-lg border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Phase 3</p>
          <p className="mt-2 text-sm font-medium">Dashboard framework only</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Operational modules unlock in later roadmap phases.</p>
        </div>
      </div>
    </aside>
  );
}
