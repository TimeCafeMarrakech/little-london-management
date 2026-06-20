"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  classFormSchema,
  classStatusFormSchema,
  courseFormSchema,
  courseStatusFormSchema,
  studentEnrolmentRemoveSchema,
  studentEnrolmentSchema,
  teacherAssignmentRemoveSchema,
  teacherAssignmentSchema,
} from "@/features/academic/schemas";
import type { AcademicActionState } from "@/features/academic/types";
import { requireUserProfile } from "@/lib/auth/session";
import {
  assignTeacherToClass,
  createClass,
  createCourse,
  enrolStudentInClass,
  removeStudentFromClass,
  removeTeacherFromClass,
  updateClass,
  updateClassStatus,
  updateCourse,
  updateCourseStatus,
} from "@/services/academic/academic-service";

const defaultErrorMessage = "Something went wrong. Please review the details and try again.";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function validationState(message: string, fieldErrors?: Record<string, string[]>): AcademicActionState {
  return { success: false, message, fieldErrors };
}

function errorState(error: unknown): AcademicActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage academic records.");
  }

  if (message === "class_full") {
    return validationState("This class is already at capacity.");
  }

  if (message === "capacity_below_enrolments") {
    return validationState("Capacity cannot be lower than the number of active enrolments.");
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("This record already exists.");
  }

  return validationState(defaultErrorMessage);
}

export async function createCourseAction(_previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = courseFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  let courseId: string;

  try {
    const profile = await requireUserProfile();
    courseId = await createCourse(profile, parsed.data);
    revalidatePath("/courses");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/courses/${courseId}`);
}

export async function updateCourseAction(courseId: string, _previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = courseFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateCourse(profile, courseId, parsed.data);
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/courses/${courseId}`);
}

export async function updateCourseStatusAction(courseId: string, _previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = courseStatusFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a valid course status.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateCourseStatus(profile, courseId, parsed.data);
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    return { success: true, message: "Course status updated." };
  } catch (error) {
    return errorState(error);
  }
}

export async function createClassAction(_previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = classFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  let classId: string;

  try {
    const profile = await requireUserProfile();
    classId = await createClass(profile, parsed.data);
    revalidatePath("/classes");
    revalidatePath("/courses");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/classes/${classId}`);
}

export async function updateClassAction(classId: string, _previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = classFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateClass(profile, classId, parsed.data);
    revalidatePath("/classes");
    revalidatePath(`/classes/${classId}`);
    revalidatePath(`/courses/${parsed.data.courseId}`);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/classes/${classId}`);
}

export async function updateClassStatusAction(classId: string, _previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = classStatusFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a valid class status.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateClassStatus(profile, classId, parsed.data);
    revalidatePath("/classes");
    revalidatePath(`/classes/${classId}`);
    return { success: true, message: "Class status updated." };
  } catch (error) {
    return errorState(error);
  }
}

export async function assignTeacherToClassAction(_previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = teacherAssignmentSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a teacher and role.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await assignTeacherToClass(profile, parsed.data);
    revalidatePath("/classes");
    revalidatePath(`/classes/${parsed.data.classId}`);
    return { success: true, message: "Teacher assigned." };
  } catch (error) {
    return errorState(error);
  }
}

export async function removeTeacherFromClassAction(_previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = teacherAssignmentRemoveSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Unable to remove this assignment. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await removeTeacherFromClass(profile, parsed.data);
    revalidatePath("/classes");
    revalidatePath(`/classes/${parsed.data.classId}`);
    return { success: true, message: "Teacher assignment removed." };
  } catch (error) {
    return errorState(error);
  }
}

export async function enrolStudentInClassAction(_previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = studentEnrolmentSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a student and enrolment date.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await enrolStudentInClass(profile, parsed.data);
    revalidatePath("/classes");
    revalidatePath(`/classes/${parsed.data.classId}`);
    revalidatePath("/students");
    return { success: true, message: "Student enrolled." };
  } catch (error) {
    return errorState(error);
  }
}

export async function removeStudentFromClassAction(_previousState: AcademicActionState, formData: FormData): Promise<AcademicActionState> {
  const parsed = studentEnrolmentRemoveSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Unable to remove this enrolment. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await removeStudentFromClass(profile, parsed.data);
    revalidatePath("/classes");
    revalidatePath(`/classes/${parsed.data.classId}`);
    revalidatePath("/students");
    return { success: true, message: "Student removed from class." };
  } catch (error) {
    return errorState(error);
  }
}
