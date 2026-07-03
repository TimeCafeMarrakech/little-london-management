"use client";

import { Copy, KeyRound, MailPlus, Power, PowerOff, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { ParentActionState, ParentDetail, ParentPortalStatus } from "@/features/parents/types";

type PortalAccountCardProps = {
  parent: ParentDetail;
  inviteAction: (previousState: ParentActionState) => Promise<ParentActionState>;
  resetPasswordAction: (previousState: ParentActionState) => Promise<ParentActionState>;
  enableAction: (previousState: ParentActionState) => Promise<ParentActionState>;
  disableAction: (previousState: ParentActionState) => Promise<ParentActionState>;
};

const initialState: ParentActionState = {
  success: false,
  message: "",
};

const statusStyles: Record<ParentPortalStatus, string> = {
  not_invited: "bg-slate-100 text-slate-700 border-slate-200",
  invited: "bg-[#d6b36a]/20 text-[#8a6518] border-[#d6b36a]/40",
  active: "bg-[#a8c3b0]/25 text-[#286246] border-[#a8c3b0]/50",
  disabled: "bg-[#f24a3a]/10 text-[#b83227] border-[#f24a3a]/30",
};

function portalStatusLabel(parent: ParentDetail): string {
  if (!parent.userId && parent.portalStatus === "not_invited") {
    return "No Account";
  }

  if (parent.portalStatus === "not_invited") {
    return "No Account";
  }

  return parent.portalStatus.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ActionButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || disabled} size="sm" type="submit" variant="outline">
      {pending ? "Working..." : children}
    </Button>
  );
}

function ActionForm({
  action,
  children,
  disabled,
}: {
  action: (previousState: ParentActionState) => Promise<ParentActionState>;
  children: ReactNode;
  disabled?: boolean;
}) {
  const [, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <ActionButton disabled={disabled}>{children}</ActionButton>
    </form>
  );
}

export function ParentPortalAccountCard({
  parent,
  inviteAction,
  resetPasswordAction,
  enableAction,
  disableAction,
}: PortalAccountCardProps) {
  const [copied, setCopied] = useState(false);
  const [messageState, setMessageState] = useState<ParentActionState>(initialState);
  const portalEmail = parent.email ?? parent.portalAccount.linkedUserEmail;
  const parentPortalEnabled = parent.portalStatus === "active";

  async function copyEmail() {
    if (!portalEmail) {
      return;
    }

    await navigator.clipboard.writeText(portalEmail);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function wrapAction(action: (previousState: ParentActionState) => Promise<ParentActionState>) {
    return async (previousState: ParentActionState) => {
      const result = await action(previousState);
      setMessageState(result);
      return result;
    };
  }

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-[#fff8ee] p-5 text-[#0f2d47] shadow-[0_22px_55px_rgba(15,45,71,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f24a3a] text-white shadow-[0_12px_28px_rgba(242,74,58,0.22)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f24a3a]">Parent Portal</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Portal Account</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6f82]">
              Manage this parent&apos;s read-only portal access without exposing passwords.
            </p>
          </div>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[parent.portalStatus]}`}>
          {portalStatusLabel(parent)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">Portal Email</p>
          <p className="mt-2 break-words text-sm font-semibold">{portalEmail ?? "No email recorded"}</p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">Linked User</p>
          <p className="mt-2 break-words text-sm font-semibold">{parent.portalAccount.linkedUserEmail ?? parent.userId ?? "No linked user"}</p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">Parent Portal Enabled</p>
          <p className="mt-2 text-sm font-semibold">{parentPortalEnabled ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">Last Login</p>
          <p className="mt-2 text-sm font-semibold">{parent.portalAccount.lastLoginAt ?? "Not available yet"}</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[#eadfce] bg-white/70 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">Last Invitation</p>
        <p className="mt-2 text-sm font-semibold">{parent.portalAccount.lastInvitationAt ?? "Not available yet"}</p>
      </div>

      {messageState.message ? (
        <p className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${messageState.success ? "bg-[#a8c3b0]/20 text-[#286246]" : "bg-[#f24a3a]/10 text-[#b83227]"}`} role="status">
          {messageState.message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button disabled={!portalEmail} onClick={copyEmail} size="sm" type="button" variant="outline">
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy Login Email"}
        </Button>
        <ActionForm action={wrapAction(inviteAction)} disabled={!parent.email || parent.status !== "active"}>
          <MailPlus className="h-4 w-4" aria-hidden="true" />
          Invite Parent to Portal
        </ActionForm>
        <ActionForm action={wrapAction(resetPasswordAction)} disabled={!parent.userId || !parent.email}>
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Reset Password
        </ActionForm>
        <ActionForm action={wrapAction(enableAction)} disabled={!parent.userId || parent.portalStatus === "active"}>
          <Power className="h-4 w-4" aria-hidden="true" />
          Enable Portal
        </ActionForm>
        <ActionForm action={wrapAction(disableAction)} disabled={parent.portalStatus === "disabled"}>
          <PowerOff className="h-4 w-4" aria-hidden="true" />
          Disable Portal
        </ActionForm>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[#5b6f82]">
        <UserRound className="h-4 w-4" aria-hidden="true" />
        <span>Parents receive setup or reset links by email. Passwords are never shown to staff.</span>
      </div>
    </section>
  );
}
