"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { roleLabels, roleNavigation } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type MobileNavigationProps = {
  profile: UserProfile;
};

export function MobileNavigation({ profile }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const navigation = roleNavigation[profile.role];

  return (
    <div className="lg:hidden">
      <Button aria-label="Open navigation" onClick={() => setOpen(true)} size="icon" type="button" variant="outline">
        <Menu className="h-4 w-4" aria-hidden="true" />
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="flex h-full w-full max-w-sm flex-col overflow-hidden bg-card p-5 shadow-soft">
            <div className="flex shrink-0 items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Little London</p>
                <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
              </div>
              <Button aria-label="Close navigation" onClick={() => setOpen(false)} size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <nav className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    aria-disabled={item.disabled}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left",
                      item.active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                      item.disabled && "cursor-not-allowed opacity-65",
                    )}
                    href={item.disabled || !item.href ? "#" : item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("block text-xs", item.active ? "text-primary-foreground/75" : "text-muted-foreground")}>
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
