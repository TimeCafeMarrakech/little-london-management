import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const optionalTime = optionalText.pipe(z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM time format.").nullable()).or(z.null());

export const eventCategorySchema = z.enum(["workshop", "holiday_camp", "birthday_event", "drama_event", "seasonal_event", "drop_play", "other"]);
export const eventStatusSchema = z.enum(["draft", "active", "completed", "cancelled", "archived"]);
export const bookingStatusSchema = z.enum(["pending", "confirmed"]);
export const paymentStatusSchema = z.enum(["unpaid", "invoiced", "partially_paid", "paid", "waived"]);
export const eventStaffRoleSchema = z.enum(["lead", "assistant", "support", "host", "coordinator"]);

export const eventFormSchema = z.object({
  eventTypeId: z.string().uuid("Choose an event type."),
  eventCode: z.string().trim().min(2, "Event code is required.").max(60),
  title: z.string().trim().min(2, "Title is required.").max(160),
  description: optionalText,
  startDate: z.string().date("Choose a start date."),
  endDate: z.string().date("Choose an end date."),
  startTime: optionalTime,
  endTime: optionalTime,
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1.").max(1000),
  price: z.coerce.number().min(0, "Price cannot be negative.").max(999999).transform((value) => Math.round(value * 100) / 100),
  status: eventStatusSchema,
  location: optionalText,
  notes: optionalText,
}).refine((value) => value.endDate >= value.startDate, {
  message: "End date must be on or after start date.",
  path: ["endDate"],
}).refine((value) => !value.startTime || !value.endTime || value.endTime > value.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

export const eventListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  category: z.enum(["all", "workshop", "holiday_camp", "birthday_event", "drama_event", "seasonal_event", "drop_play", "other"]).optional().default("all"),
  status: z.enum(["all", "draft", "active", "completed", "cancelled", "archived"]).optional().default("all"),
  dateFrom: z.string().date().optional().or(z.literal("")).default(""),
  dateTo: z.string().date().optional().or(z.literal("")).default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["created_at", "start_date", "title", "event_code", "status"]).optional().default("start_date"),
  direction: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const eventBookingSchema = z.object({
  eventId: z.string().uuid(),
  studentId: z.string().uuid("Choose a student."),
  parentId: z.string().uuid("Choose a linked parent."),
  bookingStatus: bookingStatusSchema,
  paymentStatus: paymentStatusSchema,
  invoiceId: optionalText.pipe(z.string().uuid().nullable()).or(z.null()),
  notes: optionalText,
});

export const eventBookingCancelSchema = z.object({
  eventId: z.string().uuid(),
  bookingId: z.string().uuid(),
});

export const eventStaffAssignmentSchema = z.object({
  eventId: z.string().uuid(),
  teacherId: z.string().uuid("Choose a teacher."),
  role: eventStaffRoleSchema,
});

export const eventStaffRemoveSchema = z.object({
  eventId: z.string().uuid(),
  assignmentId: z.string().uuid(),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
export type EventBookingInput = z.infer<typeof eventBookingSchema>;
export type EventBookingCancelInput = z.infer<typeof eventBookingCancelSchema>;
export type EventStaffAssignmentInput = z.infer<typeof eventStaffAssignmentSchema>;
export type EventStaffRemoveInput = z.infer<typeof eventStaffRemoveSchema>;
