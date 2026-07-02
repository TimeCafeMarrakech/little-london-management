"use client";

import { BusinessDocumentActions } from "@/components/business-documents/business-document-actions";

type InvoicePdfActionsProps = {
  invoiceId: string;
  invoiceNumber: string;
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
};

export function InvoicePdfActions({ invoiceId, invoiceNumber, emailSubject, emailBody, whatsAppMessage }: InvoicePdfActionsProps) {
  const previewUrl = `/invoices/${invoiceId}/invoice-pdf`;

  return (
    <BusinessDocumentActions
      title="Little London Invoice PDF"
      description={`Preview, download, print, or prepare parent-safe sharing text for invoice ${invoiceNumber}.`}
      previewUrl={previewUrl}
      emailSubject={emailSubject}
      emailBody={emailBody}
      whatsAppMessage={whatsAppMessage}
    />
  );
}
