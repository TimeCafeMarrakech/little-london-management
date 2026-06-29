"use client";

import { Copy, Download, Eye, Mail, MessageCircle, Printer } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type InvoicePdfActionsProps = {
  invoiceId: string;
  invoiceNumber: string;
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
};

type CopyState = "idle" | "email" | "whatsapp";

function encodeMailto(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function InvoicePdfActions({ invoiceId, invoiceNumber, emailSubject, emailBody, whatsAppMessage }: InvoicePdfActionsProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState<CopyState>("idle");
  const previewUrl = `/invoices/${invoiceId}/invoice-pdf`;
  const downloadUrl = `${previewUrl}?download=1`;
  const mailtoUrl = useMemo(() => encodeMailto(emailSubject, emailBody), [emailSubject, emailBody]);

  async function copyText(value: string, state: CopyState) {
    await navigator.clipboard.writeText(value);
    setCopied(state);
    window.setTimeout(() => setCopied("idle"), 2200);
  }

  function printPdf() {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-[#fff8ee] p-5 text-[#0f2d47] shadow-[0_22px_55px_rgba(15,45,71,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f24a3a]">Business Documents</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Little London Invoice PDF</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6f82]">
            Preview, download, print, or prepare parent-safe sharing text for invoice {invoiceNumber}.
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#8cc9a8]/20 px-3 py-1 text-xs font-semibold text-[#0f2d47]">Admin Version</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Button asChild variant="outline">
          <a href={previewUrl} rel="noreferrer" target="_blank">
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview
          </a>
        </Button>
        <Button asChild>
          <a href={downloadUrl}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </a>
        </Button>
        <Button onClick={printPdf} type="button" variant="outline">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print
        </Button>
        <Button onClick={() => setShowEmail((current) => !current)} type="button" variant="outline">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Prepare Email
        </Button>
        <Button onClick={() => copyText(whatsAppMessage, "whatsapp")} type="button" variant="outline">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Copy WhatsApp
        </Button>
      </div>

      {copied !== "idle" ? (
        <p className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-sm font-medium text-[#0f2d47]" role="status">
          {copied === "email" ? "Email text copied." : "WhatsApp message copied."}
        </p>
      ) : null}

      {showEmail ? (
        <div className="mt-5 rounded-[1.25rem] border border-[#eadfce] bg-white/85 p-4 shadow-inner-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0f2d47]">Email-ready text</p>
              <p className="mt-1 text-xs text-[#5b6f82]">Download the PDF, then attach it manually to your email.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => copyText(`Subject: ${emailSubject}\n\n${emailBody}`, "email")} size="sm" type="button" variant="outline">
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy email text
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={mailtoUrl}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Open email
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-[#fff8ee] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Subject</p>
              <p className="mt-2 text-sm text-[#0f2d47]">{emailSubject}</p>
            </div>
            <div className="rounded-2xl bg-[#fff8ee] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Body</p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-[#0f2d47]">{emailBody}</pre>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
