"use client";

import { BusinessDocumentActions } from "@/components/business-documents/business-document-actions";

type RegistrationFormActionsProps = {
  studentId: string;
  studentName: string;
  registrationDate: string;
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
};

export function RegistrationFormActions({
  studentId,
  studentName,
  registrationDate,
  emailSubject,
  emailBody,
  whatsAppMessage,
}: RegistrationFormActionsProps) {
  const previewUrl = `/students/${studentId}/registration-form`;

  return (
    <BusinessDocumentActions
      title="Student Registration Form"
      description={`Generate a parent-friendly A4 registration PDF for ${studentName}. Registration Date: ${registrationDate}.`}
      previewUrl={previewUrl}
      emailSubject={emailSubject}
      emailBody={emailBody}
      whatsAppMessage={whatsAppMessage}
    />
  );
}
