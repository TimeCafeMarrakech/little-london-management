"use client";

import { BusinessDocumentActions } from "@/components/business-documents/business-document-actions";

type ReceiptPdfActionsProps = {
  paymentId: string;
  paymentNumber: string;
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
};

export function ReceiptPdfActions({ paymentId, paymentNumber, emailSubject, emailBody, whatsAppMessage }: ReceiptPdfActionsProps) {
  const previewUrl = `/payments/${paymentId}/receipt-pdf`;

  return (
    <BusinessDocumentActions
      title="Little London Receipt PDF"
      description={`Preview, download, print, or prepare parent-safe sharing text for payment ${paymentNumber}.`}
      previewUrl={previewUrl}
      emailSubject={emailSubject}
      emailBody={emailBody}
      whatsAppMessage={whatsAppMessage}
    />
  );
}
