import type { StudentDetail } from "@/features/students/types";
import type { InvoiceDetail, PaymentDetail } from "@/features/finance/types";
import { formatMoney, formatPaymentMethod } from "@/services/business-documents/pdf-formatters";

function primaryParent(student: StudentDetail) {
  return student.parents.find((parent) => parent.isPrimaryContact) ?? student.parents[0] ?? null;
}

export function getRegistrationFormEmail(student: StudentDetail) {
  const parent = primaryParent(student);
  const parentName = parent?.parentFullName ?? "Parent";

  return {
    subject: `Little London Registration Form - ${student.fullName}`,
    body: `Bonjour ${parentName},\nVeuillez trouver ci-joint le formulaire d'inscription de ${student.fullName}.\nMerci,\nLittle London`,
  };
}

export function getRegistrationFormWhatsAppMessage(student: StudentDetail): string {
  const parent = primaryParent(student);
  const parentName = parent?.parentFullName ?? "Parent";

  return `Bonjour ${parentName}, veuillez trouver le formulaire d'inscription de ${student.fullName}. Merci, Little London.`;
}

export function getInvoiceEmail(invoice: InvoiceDetail) {
  return {
    subject: `Little London Invoice ${invoice.invoiceNumber} - ${invoice.studentName}`,
    body: `Bonjour ${invoice.parentName},\nVeuillez trouver ci-joint la facture ${invoice.invoiceNumber} pour ${invoice.studentName}.\nMontant total: ${formatMoney(invoice.total)}.\nSolde restant: ${formatMoney(invoice.balanceDue)}.\nMerci,\nLittle London`,
  };
}

export function getInvoiceWhatsAppMessage(invoice: InvoiceDetail): string {
  return `Bonjour ${invoice.parentName}, veuillez trouver la facture ${invoice.invoiceNumber} pour ${invoice.studentName}. Total: ${formatMoney(invoice.total)}. Solde restant: ${formatMoney(invoice.balanceDue)}. Merci, Little London.`;
}

export function getReceiptEmail(payment: PaymentDetail) {
  return {
    subject: `Little London Receipt ${payment.paymentNumber} - ${payment.studentName}`,
    body: `Bonjour ${payment.parentName},\nNous confirmons la r\u00e9ception de votre paiement de ${formatMoney(payment.amount)} pour ${payment.studentName}.\nMode de paiement: ${formatPaymentMethod(payment.paymentMethod)}.\nMerci,\nLittle London`,
  };
}

export function getReceiptWhatsAppMessage(payment: PaymentDetail): string {
  return `Bonjour ${payment.parentName}, nous confirmons la r\u00e9ception de votre paiement de ${formatMoney(payment.amount)} pour ${payment.studentName}. Mode de paiement: ${formatPaymentMethod(payment.paymentMethod)}. Merci, Little London.`;
}
