import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

export const teacherStatusSchema = z.enum(["active", "inactive", "archived"]);
export const teacherEmploymentTypeSchema = z.enum(["full_time", "part_time", "contractor", "substitute"]);

export const teacherFormSchema = z.object({
  teacherNumber: z.string().trim().min(2, "Teacher number is required.").max(40),
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: optionalText.pipe(z.string().email().nullable()).or(z.null()),
  phone: optionalText,
  status: teacherStatusSchema,
  employmentType: teacherEmploymentTypeSchema,
  hireDate: optionalText.pipe(z.string().date().nullable()).or(z.null()),
  qualifications: optionalText,
  bio: optionalText,
  availabilityNotes: optionalText,
});

export const teacherListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  status: z.enum(["all", "active", "inactive", "archived"]).optional().default("active"),
  employmentType: z.enum(["all", "full_time", "part_time", "contractor", "substitute"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["full_name", "teacher_number", "created_at", "updated_at", "status", "hire_date"]).optional().default("created_at"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const teacherStatusFormSchema = z.object({
  status: teacherStatusSchema,
  reason: z.string().trim().max(240).optional().default(""),
});

export type TeacherFormInput = z.infer<typeof teacherFormSchema>;
export type TeacherListQuery = z.infer<typeof teacherListQuerySchema>;
export type TeacherStatusInput = z.infer<typeof teacherStatusFormSchema>;
