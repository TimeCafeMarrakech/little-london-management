"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  invoiceArchiveSchema,
  invoiceFormSchema,
  paymentFormSchema,
} from "@/features/finance/schemas";
import type { FinanceActionState } from "@/features/finance/types";
import { requireUserProfile } from "@/lib/auth/session";
import { archiveInvoice, createInvoice, recordPayment, updateInvoice } from "@/services/finance/finance-service";

const defaultErrorMessage = "Something went wrong. Please review the finance details and try again.";

function validationState(message: string, fieldErrors?: Record<string, string[]>): FinanceActionState {
  return { success: false, message, fieldErrors };
}

function firstValues(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((value) => String(value));
}

function formDataToInvoiceInput(formData: FormData) {
  const descriptions = firstValues(formData, "itemDescription");
  const quantities = firstValues(formData, "itemQuantity");
  const unitPrices = firstValues(formData, "itemUnitPrice");
  const items = descriptions
    .map((description, index) => ({
      description,
      quantity: quantities[index] ?? "",
      unitPrice: unitPrices[index] ?? "",
    }))
    .filter((item) => item.description.trim().length > 0 || item.quantity.trim().length > 0 || item.unitPrice.trim().length > 0);

  return {
    invoiceNumber: formData.get("invoiceNumber"),
    parentId: formData.get("parentId"),
    studentId: formData.get("studentId"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    items,
  };
}

function formDataToPaymentInput(formData: FormData) {
  const invoiceIds = firstValues(formData, "allocationInvoiceId");
  const amounts = firstValues(formData, "allocationAmount");
  const allocations = invoiceIds
    .map((invoiceId, index) => ({
      invoiceId,
      amountAllocated: amounts[index] ?? "",
    }))
    .filter((allocation) => allocation.invoiceId.trim().length > 0 || allocation.amountAllocated.trim().length > 0);

  return {
    paymentNumber: formData.get("paymentNumber"),
    parentId: formData.get("parentId"),
    studentId: formData.get("studentId"),
    paymentDate: formData.get("paymentDate"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    referenceNumber: formData.get("referenceNumber"),
    notes: formData.get("notes"),
    allocations,
  };
}

function errorState(error: unknown): FinanceActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage finance records.");
  }

  if (message.includes("only_draft_invoices_can_be_edited")) {
    return validationState("Only draft invoices can be edited.");
  }

  if (message.includes("invalid_parent_student_relationship")) {
    return validationState("The selected parent and student are not actively linked. Please link the student to this parent before creating finance records.");
  }

  if (message.includes("invalid_invoice_item")) {
    return validationState("Each invoice item needs a description, a quantity greater than zero, and a valid unit price.");
  }

  if (message.includes("invalid_payment_method")) {
    return validationState("Choose a valid payment method.");
  }

  if (message.includes("due_date_before_issue_date")) {
    return validationState("Due date must be on or after the issue date.");
  }

  if (message.includes("invoice_requires_items")) {
    return validationState("Add at least one invoice item.");
  }

  if (message.includes("allocation_exceeds_invoice_balance")) {
    return validationState("An allocation is greater than the remaining invoice balance.");
  }

  if (message.includes("allocations_exceed_payment_amount")) {
    return validationState("Allocated amount cannot exceed the payment amount.");
  }

  if (message.includes("invoice_not_allocatable")) {
    return validationState("Payments can only be allocated to issued or partially paid invoices for the selected parent and student.");
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("This invoice or payment number already exists.");
  }

  return validationState(defaultErrorMessage);
}

export async function createInvoiceAction(_previousState: FinanceActionState, formData: FormData): Promise<FinanceActionState> {
  const parsed = invoiceFormSchema.safeParse(formDataToInvoiceInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted invoice fields.", parsed.error.flatten().fieldErrors);
  }

  let invoiceId: string;

  try {
    const profile = await requireUserProfile();
    invoiceId = await createInvoice(profile, parsed.data);
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/invoices/${invoiceId}`);
}

export async function updateInvoiceAction(invoiceId: string, _previousState: FinanceActionState, formData: FormData): Promise<FinanceActionState> {
  const parsed = invoiceFormSchema.safeParse(formDataToInvoiceInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted invoice fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateInvoice(profile, invoiceId, parsed.data);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/invoices/${invoiceId}`);
}

export async function archiveInvoiceAction(_previousState: FinanceActionState, formData: FormData): Promise<FinanceActionState> {
  const parsed = invoiceArchiveSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return validationState("Unable to archive this invoice. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await archiveInvoice(profile, parsed.data.invoiceId);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${parsed.data.invoiceId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Invoice archived." };
  } catch (error) {
    return errorState(error);
  }
}

export async function recordPaymentAction(_previousState: FinanceActionState, formData: FormData): Promise<FinanceActionState> {
  const parsed = paymentFormSchema.safeParse(formDataToPaymentInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted payment fields.", parsed.error.flatten().fieldErrors);
  }

  let paymentId: string;

  try {
    const profile = await requireUserProfile();
    paymentId = await recordPayment(profile, parsed.data);
    revalidatePath("/payments");
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/payments/${paymentId}`);
}
