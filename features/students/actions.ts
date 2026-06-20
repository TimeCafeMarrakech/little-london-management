"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserProfile } from "@/lib/auth/session";
import { createStudent, updateStudent, updateStudentStatus } from "@/services/students/student-service";
import { studentFormSchema, studentStatusFormSchema } from "@/features/students/schemas";
import type { StudentActionState } from "@/features/students/types";

const defaultErrorMessage = "Something went wrong. Please review the details and try again.";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function validationState(message: string, fieldErrors?: Record<string, string[]>): StudentActionState {
  return {
    success: false,
    message,
    fieldErrors,
  };
}

function errorState(error: unknown): StudentActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage students.");
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("A student with this number already exists.");
  }

  return validationState(defaultErrorMessage);
}

export async function createStudentAction(_previousState: StudentActionState, formData: FormData): Promise<StudentActionState> {
  const parsed = studentFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  let studentId: string;

  try {
    const profile = await requireUserProfile();
    studentId = await createStudent(profile, parsed.data);
    revalidatePath("/students");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/students/${studentId}`);
}

export async function updateStudentAction(
  studentId: string,
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const parsed = studentFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateStudent(profile, studentId, parsed.data);

    revalidatePath("/students");
    revalidatePath(`/students/${studentId}`);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/students/${studentId}`);
}

export async function updateStudentStatusAction(
  studentId: string,
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const parsed = studentStatusFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a valid student status.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateStudentStatus(profile, studentId, parsed.data);

    revalidatePath("/students");
    revalidatePath(`/students/${studentId}`);
    return {
      success: true,
      message: "Student status updated.",
    };
  } catch (error) {
    return errorState(error);
  }
}
