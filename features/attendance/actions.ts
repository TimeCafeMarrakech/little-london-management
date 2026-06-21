"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  attendanceCorrectionSchema,
  attendanceRecordsUpdateSchema,
  attendanceSessionIdSchema,
  attendanceStatusSchema,
  createAttendanceSessionSchema,
} from "@/features/attendance/schemas";
import type { AttendanceActionState } from "@/features/attendance/types";
import { requireUserProfile } from "@/lib/auth/session";
import {
  correctAttendanceRecord,
  createAttendanceSession,
  lockAttendanceSession,
  reviewAttendanceSession,
  submitAttendanceSession,
  updateAttendanceRecords,
} from "@/services/attendance/attendance-service";

const defaultErrorMessage = "Something went wrong. Please review the details and try again.";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function validationState(message: string, fieldErrors?: Record<string, string[]>): AttendanceActionState {
  return { success: false, message, fieldErrors };
}

function errorState(error: unknown): AttendanceActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage this attendance session.");
  }

  if (message === "empty_roster") {
    return validationState("This class has no active enrolled students yet.");
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("An attendance session already exists for this class and date.");
  }

  if (message === "not_found") {
    return validationState("The attendance record could not be found.");
  }

  if (message === "same_status") {
    return validationState("Choose a different status before saving a correction.");
  }

  return validationState(defaultErrorMessage);
}

export async function createAttendanceSessionAction(_previousState: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const parsed = createAttendanceSessionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a class and session date.", parsed.error.flatten().fieldErrors);
  }

  let attendanceSessionId: string;

  try {
    const profile = await requireUserProfile();
    attendanceSessionId = await createAttendanceSession(profile, parsed.data);
    revalidatePath("/attendance");
    revalidatePath(`/classes/${parsed.data.classId}`);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/attendance/${attendanceSessionId}`);
}

export async function updateAttendanceRecordsAction(_previousState: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const attendanceSessionId = formData.get("attendanceSessionId");

  if (typeof attendanceSessionId !== "string") {
    return validationState("Attendance session is missing.");
  }

  const recordIds = formData.getAll("recordId").filter((value): value is string => typeof value === "string");
  const records = recordIds.map((id) => {
    const status = formData.get(`status_${id}`);
    const arrivalTime = formData.get(`arrivalTime_${id}`);
    const notes = formData.get(`notes_${id}`);

    return {
      id,
      status: typeof status === "string" && attendanceStatusSchema.safeParse(status).success ? status : "",
      arrivalTime: typeof arrivalTime === "string" && arrivalTime.length > 0 ? arrivalTime : null,
      notes: typeof notes === "string" && notes.trim().length > 0 ? notes : null,
    };
  });
  const parsed = attendanceRecordsUpdateSchema.safeParse({ attendanceSessionId, records });

  if (!parsed.success) {
    return validationState("Please fix the highlighted attendance rows.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateAttendanceRecords(profile, parsed.data);
    revalidatePath("/attendance");
    revalidatePath(`/attendance/${attendanceSessionId}`);
    return { success: true, message: "Attendance draft saved." };
  } catch (error) {
    return errorState(error);
  }
}

export async function submitAttendanceSessionAction(_previousState: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const parsed = attendanceSessionIdSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Attendance session is missing.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await submitAttendanceSession(profile, parsed.data.attendanceSessionId);
    revalidatePath("/attendance");
    revalidatePath(`/attendance/${parsed.data.attendanceSessionId}`);
    return { success: true, message: "Attendance submitted." };
  } catch (error) {
    return errorState(error);
  }
}

export async function reviewAttendanceSessionAction(_previousState: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const parsed = attendanceSessionIdSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Attendance session is missing.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await reviewAttendanceSession(profile, parsed.data.attendanceSessionId);
    revalidatePath("/attendance");
    revalidatePath(`/attendance/${parsed.data.attendanceSessionId}`);
    return { success: true, message: "Attendance reviewed." };
  } catch (error) {
    return errorState(error);
  }
}

export async function lockAttendanceSessionAction(_previousState: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const parsed = attendanceSessionIdSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Attendance session is missing.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await lockAttendanceSession(profile, parsed.data.attendanceSessionId);
    revalidatePath("/attendance");
    revalidatePath(`/attendance/${parsed.data.attendanceSessionId}`);
    return { success: true, message: "Attendance locked." };
  } catch (error) {
    return errorState(error);
  }
}

export async function correctAttendanceRecordAction(_previousState: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const parsed = attendanceCorrectionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Choose a new status and add a correction reason.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await correctAttendanceRecord(profile, parsed.data);
    revalidatePath("/attendance");
    revalidatePath(`/attendance/${parsed.data.attendanceSessionId}`);
    return { success: true, message: "Attendance correction saved." };
  } catch (error) {
    return errorState(error);
  }
}
