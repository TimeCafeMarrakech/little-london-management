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

function MobileLogoMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f24a3a] text-white shadow-[0_12px_28px_rgba(242,74,58,0.22)]">
      <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="12" width="40" height="33" rx="6" stroke="currentColor" strokeWidth="4" />
        <path d="M18 23h28M18 33h28M25 12v33M39 12v33" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="23" cy="49" r="4" stroke="currentColor" strokeWidth="4" />
        <circle cx="41" cy="49" r="4" stroke="currentColor" strokeWidth="4" />
      </svg>
    </span>
  );
}

export function MobileNavigation({ profile }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const navigation = roleNavigation[profile.role];

  return (
    <div className="lg:hidden">
      <Button aria-label="Open navigation" onClick={() => setOpen(true)} size="icon" type="button" variant="outline">
        <Menu className="h-4 w-4" aria-hidden="true" />
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-[#0f2d47]/25 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="flex h-full w-full max-w-sm flex-col overflow-hidden bg-[#fff8ee] p-5 text-[#0f2d47] shadow-premium">
            <div className="flex shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <MobileLogoMark />
                <div>
                  <p className="font-serif text-sm font-bold uppercase tracking-[0.08em] text-[#f24a3a]">Little London</p>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[#68a783]">Play & Learn</p>
                  <p className="mt-1 text-xs text-[#5b6f82]">{roleLabels[profile.role]}</p>
                </div>
              </div>
              <Button aria-label="Close navigation" className="text-[#0f2d47] hover:bg-[#f24a3a]/10 hover:text-[#f24a3a]" onClick={() => setOpen(false)} size="icon" type="button" variant="ghost">
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
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left",
                      item.active ? "border border-[#f24a3a]/20 bg-[#f24a3a]/10 text-[#0f2d47]" : "bg-white/80 text-[#465e74] hover:text-[#f24a3a]",
                      item.disabled && "cursor-not-allowed opacity-65",
                    )}
                    href={item.disabled || !item.href ? "#" : item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", item.active ? "bg-[#f24a3a] text-white" : "bg-[#ddeaf5] text-[#0f2d47]")}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("block text-xs", item.active ? "text-[#5b6f82]" : "text-[#7d8da0]")}>
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
