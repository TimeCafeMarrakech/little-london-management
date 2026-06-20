"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { teacherFormSchema, teacherStatusFormSchema } from "@/features/teachers/schemas";
import type { TeacherActionState } from "@/features/teachers/types";
import { requireUserProfile } from "@/lib/auth/session";
import { createTeacher, updateTeacher, updateTeacherStatus } from "@/services/teachers/teacher-service";

const defaultErrorMessage = "Something went wrong. Please review the details and try again.";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function validationState(message: string, fieldErrors?: Record<string, string[]>): TeacherActionState {
  return {
    success: false,
    message,
    fieldErrors,
  };
}

function errorState(error: unknown): TeacherActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage teachers.");
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("A teacher with this teacher number, email, or linked user already exists.");
  }

  return validationState(defaultErrorMessage);
}

export async function createTeacherAction(_previousState: TeacherActionState, formData: FormData): Promise<TeacherActionState> {
  const parsed = teacherFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  let teacherId: string;

  try {
    const profile = await requireUserProfile();
    teacherId = await createTeacher(profile, parsed.data);
    revalidatePath("/teachers");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/teachers/${teacherId}`);
}

export async function updateTeacherAction(
  teacherId: string,
  _previousState: TeacherActionState,
  formData: FormData,
): Promise<TeacherActionState> {
  const parsed = teacherFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateTeacher(profile, teacherId, parsed.data);
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${teacherId}`);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/teachers/${teacherId}`);
}

export async function updateTeacherStatusAction(
  teacherId: string,
  _previousState: TeacherActionState,
  formData: FormData,
): Promise<TeacherActionState> {
  const parsed = teacherStatusFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a valid teacher status.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateTeacherStatus(profile, teacherId, parsed.data);
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${teacherId}`);

    return {
      success: true,
      message: "Teacher status updated.",
    };
  } catch (error) {
    return errorState(error);
  }
}
