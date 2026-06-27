import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Globe2,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
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
        {!compact ? <MobileBrandSummary /> : null}
      </div>
    </section>
  );
}

export function PlayLearnAuthCard({ children, eyebrow, title, subtitle, centered = false }: PlayLearnAuthCardProps) {
  return (
    <div className="relative w-full max-w-[640px] overflow-hidden rounded-[2rem] border border-white/90 bg-white/[0.96] px-6 pb-4 pt-16 shadow-[0_34px_95px_rgba(23,50,74,0.16)] backdrop-blur md:px-12 md:pb-5 md:pt-20">
      <LanguagePill />
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

export function DisabledSocialButtons() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm font-medium text-[#52677A]">
        <span className="h-px flex-1 bg-[#D9E1E8]" />
        or continue with
        <span className="h-px flex-1 bg-[#D9E1E8]" />
      </div>
      <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-5">
        <SocialButton label="Google" icon={<GoogleMark />} />
        <SocialButton label="Microsoft" icon={<MicrosoftMark />} />
        <SocialButton label="Apple" icon={<AppleMark />} />
      </div>
      <p className="mx-auto w-fit rounded-full bg-[#F8F6F2] px-3 py-1 text-xs font-medium text-[#52677A]">Coming Soon</p>
      <CardLandscape />
    </div>
  );
}

export function SupportFooter() {
  return (
    <p className="mt-2 text-center text-sm text-[#718397]">
      Need help?{" "}
      <Link className="font-semibold text-[#F24A3A] hover:underline" href="mailto:support@littlelondon.local">
        Contact Support
      </Link>
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

function MobileBrandSummary() {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-[#FFF9EF]/90 p-5 shadow-[0_20px_55px_rgba(23,50,74,0.1)] lg:hidden">
      <LittleLondonPlayLogo />
      <p className="mt-5 text-2xl font-extrabold leading-tight text-[#17324A]">
        Where Little Minds Grow, <span className="text-[#F24A3A]">Play, Learn & Shine</span>
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {featureHighlights.map((feature) => (
          <div className="rounded-2xl bg-white/80 p-3 text-sm font-semibold text-[#17324A]" key={feature.label}>
            {feature.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguagePill() {
  return (
    <div className="absolute right-6 top-12 hidden items-center gap-2 rounded-xl border border-[#D9E1E8] bg-white/70 px-4 py-2 text-sm font-medium text-[#17324A] shadow-sm md:flex">
      <Globe2 className="h-4 w-4" aria-hidden="true" />
      English
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </div>
  );
}

function SocialButton({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button
      aria-label={`${label} sign-in coming soon`}
      className="flex h-16 items-center justify-center rounded-xl border border-[#D9E1E8] bg-white/80 opacity-75 shadow-sm transition"
      disabled
      type="button"
    >
      {icon}
    </button>
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

function CardLandscape() {
  return (
    <div className="relative -mx-6 mt-1 h-12 overflow-hidden bg-[#E9F6EE] md:-mx-12" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-[#A8C3B0]/70" />
      <div className="absolute bottom-6 left-10 h-7 w-11 rounded-full bg-[#D9EFE4]" />
      <div className="absolute bottom-6 right-12 h-7 w-11 rounded-full bg-[#D9EFE4]" />
      <div className="absolute bottom-3 left-1/2 h-9 w-28 -translate-x-1/2 rounded-t-2xl bg-[#8EC9A7]" />
      <div className="absolute bottom-10 left-1/2 h-7 w-20 -translate-x-1/2 bg-[#F24A3A] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
      <div className="absolute bottom-4 left-[calc(50%-1.2rem)] h-6 w-5 rounded-t-md bg-[#C98512]" />
      <div className="absolute bottom-11 left-[calc(50%+3rem)] text-[#F6B33D]">
        <Sparkles className="h-4 w-4" />
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

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 48 48">
      <path d="M44.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h11.8c-.2 2-1.5 5-4.4 7l-.1.5 6.4 5 .4.1c4.1-3.8 6.4-9.3 6.4-16.3Z" fill="#4285F4" />
      <path d="M24 45c5.8 0 10.7-1.9 14.2-5.2l-6.8-5.3c-1.8 1.3-4.3 2.2-7.4 2.2-5.7 0-10.5-3.8-12.2-9l-.5.1-6.6 5.1-.1.5C8.1 40.2 15.3 45 24 45Z" fill="#34A853" />
      <path d="M11.8 27.7c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2l-.1-.5-6.7-5.2-.4.2C3 16.8 2 20.3 2 23.5s1 6.7 2.6 9.7l7.2-5.5Z" fill="#FBBC05" />
      <path d="M24 10.3c4 0 6.7 1.7 8.2 3.2l6-5.9C34.7 4.3 29.8 2 24 2 15.3 2 8.1 6.8 4.6 13.8l7.2 5.5c1.8-5.2 6.5-9 12.2-9Z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 28 28">
      <path d="M2 2h11.4v11.4H2V2Z" fill="#F25022" />
      <path d="M14.6 2H26v11.4H14.6V2Z" fill="#7FBA00" />
      <path d="M2 14.6h11.4V26H2V14.6Z" fill="#00A4EF" />
      <path d="M14.6 14.6H26V26H14.6V14.6Z" fill="#FFB900" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-7 text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.4 1.8c.1 1.1-.4 2.2-1.1 3-.8.9-2 1.6-3.1 1.5-.1-1.1.4-2.2 1.1-3 .8-.9 2.1-1.6 3.1-1.5Zm3.5 16.8c-.6 1.3-.9 1.8-1.7 3-.9 1.3-2.1 2.9-3.6 2.9-1.4 0-1.7-.9-3.6-.9s-2.3.9-3.6.9c-1.5.1-2.7-1.4-3.6-2.8-2.5-3.6-2.8-7.8-1.2-10 1.1-1.6 2.9-2.5 4.6-2.5 1.7 0 2.8.9 4.2.9 1.4 0 2.2-.9 4.2-.9 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3.1 8.2Z" />
    </svg>
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
