import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

type PlayLearnAuthShellProps = {
  children: ReactNode;
  compact?: boolean;
};

type PlayLearnAuthCardProps = {
  children: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  subtitle: string;
  centered?: boolean;
};

type PlayLearnInputProps = {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  icon: "mail" | "lock";
  required?: boolean;
};

const featureHighlights = [
  {
    label: "Secure & Trusted",
    description: "Your data is safe with enterprise grade security.",
    icon: ShieldCheck,
    tone: "bg-[#D9EFE4] text-[#2F755A]",
  },
  {
    label: "For Everyone",
    description: "Teachers, Parents and Admins working together.",
    icon: UsersRound,
    tone: "bg-[#FFE1D8] text-[#F24A3A]",
  },
  {
    label: "Smart Insights",
    description: "Real-time reports to help you make better decisions.",
    icon: BarChart3,
    tone: "bg-[#FFE8A8] text-[#C98512]",
  },
  {
    label: "Child Focused",
    description: "Everything we do is for their growth and happiness.",
    icon: Heart,
    tone: "bg-[#FFE1D8] text-[#F24A3A]",
  },
];

export function LittleLondonPlayLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("relative z-20 flex shrink-0 items-center gap-4", compact && "flex-col gap-3 text-center")}>
      <div className={cn("flex items-center justify-center rounded-full bg-[#F24A3A] text-white shadow-[0_18px_35px_rgba(242,74,58,0.28)]", compact ? "h-16 w-16" : "h-[70px] w-[70px]")}>
        <BusIcon />
      </div>
      <div className="min-w-max">
        <p className={cn("whitespace-nowrap font-serif font-bold uppercase tracking-[0.08em] text-[#F24A3A]", compact ? "text-2xl" : "text-[2rem] leading-none")}>Little London</p>
        <p className="mt-1 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.46em] text-[#63A883]">Play & Learn</p>
      </div>
    </div>
  );
}

export function PlayLearnAuthShell({ children, compact = false }: PlayLearnAuthShellProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FFF8EE] text-[#0F2D47] lg:h-screen">
      <div className="absolute -left-16 -top-20 z-0 h-56 w-80 rounded-br-[6rem] bg-[#F24A3A]" aria-hidden="true" />
      <div className="absolute -bottom-28 -left-20 z-0 h-72 w-[34rem] rounded-tr-[10rem] bg-[#8CC9A8]" aria-hidden="true" />
      <div className="absolute right-10 top-10 z-0 hidden h-28 w-28 rounded-full bg-[#FFE7A7]/70 blur-sm lg:block" aria-hidden="true" />

      <div
        className={cn(
          "relative z-10 mx-auto grid min-h-screen w-full max-w-[1540px] gap-5 px-4 py-4 lg:h-screen lg:min-h-0 lg:grid-cols-[1.07fr_0.93fr]",
          compact && "max-w-[760px] lg:grid-cols-1",
        )}
      >
        {!compact ? <BrandPanel /> : null}
        <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center lg:min-h-0">{children}</div>
      </div>
    </section>
  );
}

export function PlayLearnAuthCard({ children, eyebrow, title, subtitle, centered = false }: PlayLearnAuthCardProps) {
  return (
    <div className="relative w-full max-w-[640px] overflow-hidden rounded-[2rem] border border-white/90 bg-white/[0.96] px-6 pb-4 pt-16 shadow-[0_34px_95px_rgba(23,50,74,0.16)] backdrop-blur md:px-12 md:pb-5 md:pt-20">
      <div className="absolute -right-14 top-36 h-28 w-28 rounded-full bg-[#D9EFE4]/70" aria-hidden="true" />
      <div className="absolute -left-12 bottom-24 h-24 w-24 rounded-full bg-[#D9EFE4]/85" aria-hidden="true" />

      <div className={cn("relative", centered && "text-center")}>
        <div className="flex justify-center">
          <LittleLondonPlayLogo compact />
        </div>
        {eyebrow ? <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-[#63A883]">{eyebrow}</p> : null}
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F2D47] md:text-[2rem]">{title}</h1>
        <p className="mt-1 text-sm leading-6 text-[#52677A] md:text-base">{subtitle}</p>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function PlayLearnInput({ id, name, label, type, autoComplete, placeholder, icon, required = true }: PlayLearnInputProps) {
  const Icon = icon === "mail" ? Mail : LockKeyhole;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#0F2D47]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7B8EA2]" aria-hidden="true" />
        <input
          className="h-12 w-full rounded-xl border border-[#DDE5EC] bg-white/90 pl-12 pr-4 text-sm text-[#0F2D47] outline-none transition placeholder:text-[#8A9AAB] focus:border-[#F24A3A] focus:ring-4 focus:ring-[#F24A3A]/15"
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}

export function SupportFooter() {
  return (
    <p className="mt-5 text-center text-sm leading-6 text-[#718397]">
      Need access help? Contact your Little London administrator.
    </p>
  );
}

export function PlayLearnButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-[#F24A3A] px-5 text-sm font-bold text-white shadow-[0_18px_35px_rgba(242,74,58,0.28)] transition hover:bg-[#DD3F2D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F24A3A]/25"
      type="submit"
    >
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
      {children}
    </button>
  );
}

export function PlayLearnActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="font-semibold text-[#F24A3A] hover:underline" href={href}>
      {children}
    </Link>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden min-h-0 overflow-hidden rounded-[2rem] border border-white/70 bg-[#FFF9EF]/95 px-9 py-7 shadow-[0_32px_90px_rgba(23,50,74,0.13)] backdrop-blur lg:grid lg:h-[calc(100vh-2rem)] lg:grid-rows-[auto_minmax(0,1fr)_auto_auto] xl:px-12">
      <div className="absolute -left-14 top-48 h-32 w-32 rounded-full bg-[#FFE1D8]" aria-hidden="true" />
      <div className="absolute -bottom-16 -right-14 h-48 w-48 rounded-full bg-[#D9EFE4]" aria-hidden="true" />
      <div className="absolute right-0 top-20 h-[27rem] w-[28rem] rounded-l-full bg-[#BFE2D0]/80" aria-hidden="true" />
      <PendantLamp />

      <div className="relative z-10">
        <LittleLondonPlayLogo />
      </div>

      <div className="relative z-10 grid min-h-0 grid-cols-[minmax(17rem,0.86fr)_1.14fr] items-center gap-3 py-4">
        <div>
          <PaperPlane />
          <h2 className="text-[2.35rem] font-extrabold leading-[1.12] tracking-tight text-[#0F2D47] xl:text-[2.85rem]">
            <span className="block whitespace-nowrap">Where Little</span>
            <span className="block whitespace-nowrap">Minds Grow,</span>
            <span className="block whitespace-nowrap text-[#F24A3A]">Play, Learn</span>
            <span className="block whitespace-nowrap text-[#F24A3A]">& Shine</span>
          </h2>
          <div className="mt-4 h-1.5 w-20 rounded-full bg-[#8CC9A8]" />
        </div>
        <ClassroomIllustration />
      </div>

      <div className="relative z-10 grid grid-cols-4 gap-3">
        {featureHighlights.map((feature) => (
          <article className="rounded-2xl bg-white/[0.92] p-3 text-center shadow-[0_16px_45px_rgba(23,50,74,0.09)]" key={feature.label}>
            <div className={cn("mx-auto flex h-11 w-11 items-center justify-center rounded-full", feature.tone)}>
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#0F2D47]">{feature.label}</h3>
            <p className="mt-2 text-[0.72rem] leading-5 text-[#36546B]">{feature.description}</p>
          </article>
        ))}
      </div>
      <p className="relative z-10 mt-4 text-center text-xs text-[#0F2D47]">(c) 2025 Little London Kids Club. All rights reserved.</p>
    </aside>
  );
}

function ClassroomIllustration() {
  return (
    <div className="relative h-full min-h-[340px]" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-2 h-[92%] overflow-hidden rounded-[2rem]">
        <Image
          alt=""
          className="object-cover object-[50%_54%]"
          fill
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
          src="/auth/little-london-kids.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9EF]/20 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FFF9EF] to-transparent" />
      </div>
    </div>
  );
}

function PaperPlane() {
  return (
    <div className="absolute left-[48%] top-8 text-[#F6B33D]" aria-hidden="true">
      <svg className="h-24 w-32" fill="none" viewBox="0 0 128 96">
        <path d="M6 76c24-28 38 6 56-24 9-15 29-23 52-24" stroke="currentColor" strokeDasharray="7 7" strokeLinecap="round" strokeWidth="3" />
        <path d="m86 18 33-12-12 33-8-13-13-8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    </div>
  );
}

function PendantLamp() {
  return (
    <div className="absolute right-20 top-0 hidden text-[#F24A3A] xl:block" aria-hidden="true">
      <div className="mx-auto h-24 w-1 bg-current" />
      <div className="relative">
        <div className="h-12 w-20 rounded-b-full rounded-t-3xl bg-current shadow-[0_18px_35px_rgba(241,71,51,0.25)]" />
        <div className="absolute left-1/2 top-8 h-3 w-10 -translate-x-1/2 rounded-full bg-[#FFF2B8] shadow-[0_0_18px_rgba(255,232,168,0.95)]" />
        <div className="absolute left-1/2 top-9 h-28 w-40 -translate-x-1/2 rounded-b-full bg-[radial-gradient(ellipse_at_top,rgba(255,238,180,0.72),rgba(255,232,168,0.24)_42%,rgba(255,232,168,0)_72%)] blur-md" />
        <div className="absolute left-1/2 top-11 h-40 w-56 -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(255,232,168,0.34),rgba(255,232,168,0.12)_45%,rgba(255,232,168,0)_100%)] [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)] blur-xl" />
      </div>
    </div>
  );
}

function BusIcon() {
  return (
    <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 48 48">
      <rect height="27" rx="5" stroke="currentColor" strokeWidth="2.8" width="34" x="7" y="8" />
      <path d="M12 17h24M12 25h24M18 8v27M30 8v27" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      <circle cx="16" cy="37" r="4" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="32" cy="37" r="4" stroke="currentColor" strokeWidth="2.8" />
      <path d="M7 31h34" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
    </svg>
  );
}
