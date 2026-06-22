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
    <aside className="hidden h-screen max-h-screen w-72 overflow-hidden border-r border-white/10 bg-primary px-5 py-6 text-primary-foreground shadow-premium lg:fixed lg:inset-y-0 lg:left-0 lg:block">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-lg font-semibold text-accent shadow-inner-soft">
            LL
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary-foreground">Little London</p>
            <p className="text-xs text-primary-foreground/60">{roleLabels[profile.role]}</p>
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
                  item.active
                    ? "border border-accent/30 bg-accent/15 text-primary-foreground shadow-inner-soft"
                    : "text-primary-foreground/70 hover:bg-accent/10 hover:text-accent",
                  item.disabled && "cursor-not-allowed opacity-65",
                )}
                href={item.disabled || !item.href ? "#" : item.href}
                key={item.label}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md",
                    item.active ? "bg-accent text-primary" : "bg-white/10 text-primary-foreground/80 group-hover:bg-accent/15 group-hover:text-accent",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={cn("block truncate text-xs", item.active ? "text-primary-foreground/75" : "text-primary-foreground/50")}>
                    {item.description}
                  </span>
                </span>
                {item.active ? <ChevronRight className="h-4 w-4 text-accent" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 shrink-0 rounded-lg border border-accent/25 bg-white/10 p-4 shadow-inner-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Operations</p>
          <p className="mt-2 text-sm font-medium text-primary-foreground">Boutique school platform</p>
          <p className="mt-1 text-xs leading-5 text-primary-foreground/60">Calm daily oversight for Little London.</p>
        </div>
      </div>
    </aside>
  );
}
