"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  eventBookingCancelSchema,
  eventBookingSchema,
  eventFormSchema,
  eventStaffAssignmentSchema,
  eventStaffRemoveSchema,
} from "@/features/events/schemas";
import type { EventActionState } from "@/features/events/types";
import { requireUserProfile } from "@/lib/auth/session";
import {
  assignStaffToEvent,
  bookStudentIntoEvent,
  cancelEventBooking,
  createEvent,
  removeStaffFromEvent,
  updateEvent,
} from "@/services/events/event-service";

const defaultErrorMessage = "Something went wrong. Please review the event details and try again.";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function validationState(message: string, fieldErrors?: Record<string, string[]>): EventActionState {
  return { success: false, message, fieldErrors };
}

function errorState(error: unknown): EventActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage events.");
  }

  if (message.includes("duplicate_event_booking") || message.includes("duplicate key") || message.includes("unique")) {
    return validationState("This record already exists.");
  }

  if (message.includes("event_full")) {
    return validationState("This event is already at capacity.");
  }

  if (message.includes("capacity_below_bookings")) {
    return validationState("Capacity cannot be lower than the number of active bookings.");
  }

  if (message.includes("invalid_parent_student_relationship")) {
    return validationState("The selected parent and student are not actively linked.");
  }

  if (message.includes("invalid_event_invoice_link")) {
    return validationState("The selected invoice does not belong to this parent and student.");
  }

  if (message.includes("event_not_bookable")) {
    return validationState("Only draft or active events can accept bookings.");
  }

  return validationState(defaultErrorMessage);
}

export async function createEventAction(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const parsed = eventFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted event fields.", parsed.error.flatten().fieldErrors);
  }

  let eventId: string;

  try {
    const profile = await requireUserProfile();
    eventId = await createEvent(profile, parsed.data);
    revalidatePath("/events");
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/events/${eventId}`);
}

export async function updateEventAction(eventId: string, _previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const parsed = eventFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted event fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateEvent(profile, eventId, parsed.data);
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/events/${eventId}`);
}

export async function bookStudentIntoEventAction(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const parsed = eventBookingSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a student, linked parent, and valid booking status.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await bookStudentIntoEvent(profile, parsed.data);
    revalidatePath("/events");
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: "Student booked into event." };
  } catch (error) {
    return errorState(error);
  }
}

export async function cancelEventBookingAction(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const parsed = eventBookingCancelSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Unable to cancel this booking. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await cancelEventBooking(profile, parsed.data);
    revalidatePath("/events");
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: "Booking cancelled." };
  } catch (error) {
    return errorState(error);
  }
}

export async function assignStaffToEventAction(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const parsed = eventStaffAssignmentSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a staff member and role.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await assignStaffToEvent(profile, parsed.data);
    revalidatePath("/events");
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: "Staff assigned." };
  } catch (error) {
    return errorState(error);
  }
}

export async function removeStaffFromEventAction(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const parsed = eventStaffRemoveSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Unable to remove this assignment. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await removeStaffFromEvent(profile, parsed.data);
    revalidatePath("/events");
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: "Staff assignment removed." };
  } catch (error) {
    return errorState(error);
  }
}
