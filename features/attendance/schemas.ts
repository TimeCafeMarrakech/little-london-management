import { z } from "zod";

export const attendanceStatusSchema = z.enum(["present", "absent", "late", "excused", "sick"]);

export const attendanceSessionStatusSchema = z.enum(["draft", "submitted", "reviewed", "locked", "archived"]);

export const attendanceListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  classId: z.string().uuid().optional().or(z.literal("")).default(""),
  status: z.enum(["all", "draft", "submitted", "reviewed", "locked", "archived"]).optional().default("all"),
  dateFrom: z.string().date().optional().or(z.literal("")).default(""),
  dateTo: z.string().date().optional().or(z.literal("")).default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["session_date", "status", "created_at", "updated_at"]).optional().default("session_date"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createAttendanceSessionSchema = z.object({
  classId: z.string().uuid("Choose a class."),
  sessionDate: z.string().date("Choose a session date."),
});

export const attendanceRecordUpdateSchema = z.object({
  id: z.string().uuid(),
  status: attendanceStatusSchema,
  arrivalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format.").nullable(),
  notes: z.string().trim().max(500).nullable(),
});

export const attendanceRecordsUpdateSchema = z.object({
  attendanceSessionId: z.string().uuid(),
  records: z.array(attendanceRecordUpdateSchema).min(1),
});

export const attendanceSessionIdSchema = z.object({
  attendanceSessionId: z.string().uuid(),
});

export const attendanceCorrectionSchema = z.object({
  attendanceSessionId: z.string().uuid(),
  attendanceRecordId: z.string().uuid(),
  newStatus: attendanceStatusSchema,
  correctionReason: z.string().trim().min(3, "Add a correction reason.").max(500),
});

export type AttendanceListQuery = z.infer<typeof attendanceListQuerySchema>;
export type CreateAttendanceSessionInput = z.infer<typeof createAttendanceSessionSchema>;
export type AttendanceRecordsUpdateInput = z.infer<typeof attendanceRecordsUpdateSchema>;
export type AttendanceCorrectionInput = z.infer<typeof attendanceCorrectionSchema>;
