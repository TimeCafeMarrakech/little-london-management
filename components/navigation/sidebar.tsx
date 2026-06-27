import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { roleLabels, roleNavigation } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type SidebarProps = {
  profile: UserProfile;
};

function BusLogoMark() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f24a3a] text-white shadow-[0_14px_30px_rgba(242,74,58,0.22)]">
      <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="12" width="40" height="33" rx="6" stroke="currentColor" strokeWidth="4" />
        <path d="M18 23h28M18 33h28M25 12v33M39 12v33" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="23" cy="49" r="4" stroke="currentColor" strokeWidth="4" />
        <circle cx="41" cy="49" r="4" stroke="currentColor" strokeWidth="4" />
      </svg>
    </span>
  );
}

export function Sidebar({ profile }: SidebarProps) {
  const navigation = roleNavigation[profile.role];

  return (
    <aside className="hidden h-screen max-h-screen w-[344px] overflow-hidden border-r border-[#eadfce] bg-[#fffaf3]/96 px-5 py-6 text-[#0f2d47] shadow-[18px_0_55px_rgba(15,45,71,0.08)] backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:block">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-4 px-1">
          <BusLogoMark />
          <div>
            <p className="font-serif text-xl font-bold uppercase tracking-[0.08em] text-[#f24a3a]">Little London</p>
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.34em] text-[#68a783]">Play & Learn</p>
            <p className="mt-0.5 text-xs font-medium text-[#5b6f82]">{roleLabels[profile.role]}</p>
          </div>
        </div>

        <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                aria-disabled={item.disabled}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-[1.15rem] px-3 py-2.5 text-left transition",
                  item.active
                    ? "border border-[#f24a3a]/20 bg-[#f24a3a]/10 text-[#0f2d47] shadow-inner-soft"
                    : "text-[#465e74] hover:bg-white hover:text-[#f24a3a] hover:shadow-[0_12px_30px_rgba(15,45,71,0.07)]",
                  item.disabled && "cursor-not-allowed opacity-65",
                )}
                href={item.disabled || !item.href ? "#" : item.href}
                key={item.label}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    item.active ? "bg-[#f24a3a] text-white" : "bg-[#e6f4ec] text-[#0f2d47] group-hover:bg-[#f24a3a]/10 group-hover:text-[#f24a3a]",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={cn("block truncate text-xs", item.active ? "text-[#5b6f82]" : "text-[#7d8da0]")}>
                    {item.description}
                  </span>
                </span>
                {item.active ? <ChevronRight className="h-4 w-4 text-[#f24a3a]" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 shrink-0 overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/82 p-4 shadow-[0_16px_35px_rgba(15,45,71,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f24a3a]">Operations</p>
          <p className="mt-2 text-sm font-semibold text-[#0f2d47]">Boutique school platform</p>
          <p className="mt-1 max-w-[150px] text-xs leading-5 text-[#5b6f82]">Calm daily oversight for Little London.</p>
          <div className="relative -mx-4 -mb-4 mt-2 h-24 bg-[#e6f4ec]">
            <div className="absolute inset-x-0 bottom-0 h-9 bg-[#bfe2d0]" aria-hidden="true" />
            <div className="absolute bottom-5 left-[64%] h-12 w-20 -translate-x-1/2 rounded-t-lg bg-[#8cc9a8] shadow-inner-soft" aria-hidden="true">
              <span className="absolute -top-5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[34px] border-b-[24px] border-x-transparent border-b-[#f24a3a]" />
              <span className="absolute bottom-0 left-1/2 h-5 w-4 -translate-x-1/2 rounded-t-full bg-[#d89d1d]" />
              <span className="absolute left-4 top-3 h-2.5 w-2.5 rounded-sm bg-white/80" />
              <span className="absolute right-4 top-3 h-2.5 w-2.5 rounded-sm bg-white/80" />
            </div>
            <span className="absolute bottom-3 left-9 h-8 w-8 rounded-full bg-[#8cc9a8]" aria-hidden="true" />
            <span className="absolute bottom-3 right-5 h-9 w-9 rounded-full bg-[#8cc9a8]" aria-hidden="true" />
            <span className="absolute left-12 top-4 h-2 w-8 rounded-full bg-[#f7dcd3]" aria-hidden="true" />
            <span className="absolute right-8 top-3 h-2 w-9 rounded-full bg-[#f7dcd3]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </aside>
  );
}
