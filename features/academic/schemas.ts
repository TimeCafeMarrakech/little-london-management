import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(0).nullable(),
);

export const academicStatusSchema = z.enum(["active", "inactive", "archived"]);

export const courseFormSchema = z.object({
  courseCode: z.string().trim().min(2, "Course code is required.").max(40),
  name: z.string().trim().min(2, "Course name is required.").max(120),
  description: optionalText,
  level: optionalText,
  minimumAge: optionalNumber,
  maximumAge: optionalNumber,
  status: academicStatusSchema,
}).refine((value) => value.minimumAge == null || value.maximumAge == null || value.maximumAge >= value.minimumAge, {
  message: "Maximum age must be greater than or equal to minimum age.",
  path: ["maximumAge"],
});

export const classFormSchema = z.object({
  classCode: z.string().trim().min(2, "Class code is required.").max(40),
  courseId: z.string().uuid("Choose a course."),
  name: z.string().trim().min(2, "Class name is required.").max(120),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1.").max(500),
  status: academicStatusSchema,
  startDate: optionalText.pipe(z.string().date().nullable()).or(z.null()),
  endDate: optionalText.pipe(z.string().date().nullable()).or(z.null()),
}).refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
  message: "End date must be on or after start date.",
  path: ["endDate"],
});

export const academicListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  status: z.enum(["all", "active", "inactive", "archived"]).optional().default("active"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["name", "course_code", "class_code", "created_at", "updated_at", "status", "start_date"]).optional().default("created_at"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const courseStatusFormSchema = z.object({
  status: academicStatusSchema,
});

export const classStatusFormSchema = z.object({
  status: academicStatusSchema,
});

export const teacherAssignmentSchema = z.object({
  classId: z.string().uuid(),
  teacherId: z.string().uuid("Choose a teacher."),
  role: z.enum(["lead", "assistant", "substitute"]),
});

export const teacherAssignmentRemoveSchema = z.object({
  classId: z.string().uuid(),
  assignmentId: z.string().uuid(),
});

export const studentEnrolmentSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid("Choose a student."),
  enrolmentDate: z.string().date(),
});

export const studentEnrolmentRemoveSchema = z.object({
  classId: z.string().uuid(),
  enrolmentId: z.string().uuid(),
});

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type ClassFormInput = z.infer<typeof classFormSchema>;
export type AcademicListQuery = z.infer<typeof academicListQuerySchema>;
export type CourseStatusInput = z.infer<typeof courseStatusFormSchema>;
export type ClassStatusInput = z.infer<typeof classStatusFormSchema>;
export type TeacherAssignmentInput = z.infer<typeof teacherAssignmentSchema>;
export type TeacherAssignmentRemoveInput = z.infer<typeof teacherAssignmentRemoveSchema>;
export type StudentEnrolmentInput = z.infer<typeof studentEnrolmentSchema>;
export type StudentEnrolmentRemoveInput = z.infer<typeof studentEnrolmentRemoveSchema>;
