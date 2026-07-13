"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cashbookExpenseFormSchema, cashbookExpenseIdSchema, cashbookIncomeFormSchema, cashbookIncomeIdSchema } from "@/features/cashbook/schemas";
import type { CashbookActionState } from "@/features/cashbook/types";
import { requireUserProfile } from "@/lib/auth/session";
import {
  archiveCashbookExpense,
  archiveCashbookIncome,
  createCashbookExpense,
  createCashbookIncome,
  updateCashbookExpense,
  updateCashbookIncome,
  voidCashbookExpense,
  voidCashbookIncome,
} from "@/services/cashbook/cashbook-service";

const defaultErrorMessage = "Something went wrong. Please review the income details and try again.";

function validationState(message: string, fieldErrors?: Record<string, string[]>): CashbookActionState {
  return { success: false, message, fieldErrors };
}

function formDataToIncomeInput(formData: FormData) {
  return {
    incomeDate: formData.get("incomeDate"),
    amount: formData.get("amount"),
    businessAreaId: formData.get("businessAreaId"),
    incomeCategoryId: formData.get("incomeCategoryId"),
    paymentMethod: formData.get("paymentMethod"),
    parentId: formData.get("parentId"),
    studentId: formData.get("studentId"),
    description: formData.get("description"),
    notes: formData.get("notes"),
  };
}

function formDataToExpenseInput(formData: FormData) {
  return {
    expenseDate: formData.get("expenseDate"),
    amount: formData.get("amount"),
    expenseCategoryId: formData.get("expenseCategoryId"),
    businessAreaId: formData.get("businessAreaId"),
    paymentMethod: formData.get("paymentMethod"),
    supplierOrStaffName: formData.get("supplierOrStaffName"),
    description: formData.get("description"),
    notes: formData.get("notes"),
  };
}

function errorState(error: unknown): CashbookActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage cashbook income.");
  }

  if (message.includes("income_not_editable")) {
    return validationState("Only recorded income can be edited.");
  }

  if (message.includes("income_not_found")) {
    return validationState("This income record could not be found. Please reload Cashbook and try again.");
  }

  if (message.includes("income_already_changed")) {
    return validationState("This income record has already changed. Please reload the page and try again.");
  }

  if (message.includes("invalid_parent_student_relationship")) {
    return validationState("The selected parent and student are not actively linked.");
  }

  if (message.includes("cashbook_mutation_failed")) {
    return validationState(defaultErrorMessage);
  }

  if (message.includes("expense_not_editable")) {
    return validationState("Only recorded expenses can be edited.");
  }

  if (message.includes("expense_not_found")) {
    return validationState("This expense record could not be found. Please reload Cashbook and try again.");
  }

  if (message.includes("expense_already_changed")) {
    return validationState("This expense record has already changed. Please reload the page and try again.");
  }

  if (message.includes("invalid_expense_category")) {
    return validationState("Choose an active expense category.");
  }

  if (message.includes("cashbook_expense_mutation_failed")) {
    return validationState(defaultErrorMessage);
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("This income record already exists.");
  }

  return validationState(defaultErrorMessage);
}

export async function createCashbookIncomeAction(_previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookIncomeFormSchema.safeParse(formDataToIncomeInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted income fields.", parsed.error.flatten().fieldErrors);
  }

  let incomeId: string;

  try {
    const profile = await requireUserProfile();
    incomeId = await createCashbookIncome(profile, parsed.data);
    revalidatePath("/cashbook");
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/cashbook/${incomeId}`);
}

export async function updateCashbookIncomeAction(incomeId: string, _previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookIncomeFormSchema.safeParse(formDataToIncomeInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted income fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateCashbookIncome(profile, incomeId, parsed.data);
    revalidatePath("/cashbook");
    revalidatePath(`/cashbook/${incomeId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/cashbook/${incomeId}`);
}

export async function archiveCashbookIncomeAction(_previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookIncomeIdSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return validationState("Unable to archive this income record. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await archiveCashbookIncome(profile, parsed.data.incomeId);
    revalidatePath("/cashbook");
    revalidatePath(`/cashbook/${parsed.data.incomeId}`);
    return { success: true, message: "Income record archived." };
  } catch (error) {
    return errorState(error);
  }
}

export async function voidCashbookIncomeAction(_previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookIncomeIdSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return validationState("Unable to void this income record. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await voidCashbookIncome(profile, parsed.data.incomeId);
    revalidatePath("/cashbook");
    revalidatePath(`/cashbook/${parsed.data.incomeId}`);
    return { success: true, message: "Income record marked void." };
  } catch (error) {
    return errorState(error);
  }
}

export async function createCashbookExpenseAction(_previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookExpenseFormSchema.safeParse(formDataToExpenseInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted expense fields.", parsed.error.flatten().fieldErrors);
  }

  let expenseId: string;

  try {
    const profile = await requireUserProfile();
    expenseId = await createCashbookExpense(profile, parsed.data);
    revalidatePath("/cashbook/expenses");
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/cashbook/expenses/${expenseId}`);
}

export async function updateCashbookExpenseAction(expenseId: string, _previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookExpenseFormSchema.safeParse(formDataToExpenseInput(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted expense fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateCashbookExpense(profile, expenseId, parsed.data);
    revalidatePath("/cashbook/expenses");
    revalidatePath(`/cashbook/expenses/${expenseId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/cashbook/expenses/${expenseId}`);
}

export async function archiveCashbookExpenseAction(_previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookExpenseIdSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return validationState("Unable to archive this expense record. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await archiveCashbookExpense(profile, parsed.data.expenseId);
    revalidatePath("/cashbook/expenses");
    revalidatePath(`/cashbook/expenses/${parsed.data.expenseId}`);
    return { success: true, message: "Expense record archived." };
  } catch (error) {
    return errorState(error);
  }
}

export async function voidCashbookExpenseAction(_previousState: CashbookActionState, formData: FormData): Promise<CashbookActionState> {
  const parsed = cashbookExpenseIdSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return validationState("Unable to void this expense record. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await voidCashbookExpense(profile, parsed.data.expenseId);
    revalidatePath("/cashbook/expenses");
    revalidatePath(`/cashbook/expenses/${parsed.data.expenseId}`);
    return { success: true, message: "Expense record marked void." };
  } catch (error) {
    return errorState(error);
  }
}
