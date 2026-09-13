"use client";

import { CalendarPlus, ClipboardCheck, FilePlus2, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

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
  const pathname = usePathname();
  const navigation = roleNavigation[profile.role];
  const managementActions = profile.role === "super_admin" || profile.role === "admin" ? [
    { label: "Add student", href: "/students/new", icon: UserPlus },
    { label: "New invoice", href: "/invoices/new", icon: FilePlus2 },
    { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { label: "New event", href: "/events/new", icon: CalendarPlus },
  ] : [];

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button aria-label="Open menu" className="h-11 gap-2 rounded-xl border-[#eadfce] bg-white px-3 text-[#0f2d47] shadow-sm" onClick={() => setOpen(true)} type="button" variant="outline">
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-semibold">Menu</span>
      </Button>

      {open ? createPortal(
        <div className="fixed inset-0 z-50 bg-[#0f2d47]/30 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Application menu">
          <button className="absolute inset-0" aria-label="Close menu" onClick={() => setOpen(false)} type="button" />
          <div className="relative flex h-full w-[min(92vw,390px)] flex-col overflow-hidden rounded-r-[1.75rem] bg-[#fffaf3] p-5 text-[#0f2d47] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <MobileLogoMark />
                <div>
                  <p className="text-base font-bold text-[#0f2d47]">Menu</p>
                  <p className="mt-0.5 text-xs text-[#5b6f82]">{roleLabels[profile.role]} · Little London</p>
                </div>
              </div>
              <Button aria-label="Close navigation" className="text-[#0f2d47] hover:bg-[#f24a3a]/10 hover:text-[#f24a3a]" onClick={() => setOpen(false)} size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {managementActions.length > 0 ? <section className="mt-6 shrink-0" aria-label="Quick actions">
              <p className="px-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#68a783]">Quick actions</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {managementActions.map((action) => {
                  const Icon = action.icon;
                  return <Link className="flex min-h-20 flex-col justify-between rounded-2xl border border-[#eadfce] bg-white p-3 shadow-sm transition active:scale-[0.98]" href={action.href} key={action.label} onClick={() => setOpen(false)}>
                    <Icon className="h-5 w-5 text-[#f24a3a]" aria-hidden="true" />
                    <span className="mt-3 text-sm font-semibold">{action.label}</span>
                  </Link>;
                })}
              </div>
            </section> : null}
            <p className="mb-3 mt-6 px-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#68a783]">All areas</p>
            <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = Boolean(item.href && (pathname === item.href || item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)));

                return (
                  <Link
                    aria-disabled={item.disabled}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left",
                      active ? "border border-[#f24a3a]/20 bg-[#f24a3a]/10 text-[#0f2d47]" : "text-[#465e74] hover:bg-white hover:text-[#f24a3a]",
                      item.disabled && "cursor-not-allowed opacity-65",
                    )}
                    href={item.disabled || !item.href ? "#" : item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", active ? "bg-[#f24a3a] text-white" : "bg-[#e6f4ec] text-[#0f2d47]")}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("block text-xs", active ? "text-[#5b6f82]" : "text-[#7d8da0]")}>
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
