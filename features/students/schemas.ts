import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

export const studentStatusSchema = z.enum(["active", "inactive", "archived"]);

export const studentFormSchema = z.object({
  studentNumber: z.string().trim().min(2, "Student number is required.").max(40),
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  dateOfBirth: z.coerce.date().max(new Date(), "Date of birth cannot be in the future."),
  gender: z.enum(["", "female", "male", "other", "prefer_not_to_say"]).transform((value) => (value === "" ? null : value)),
  primaryLanguage: optionalText,
  schoolName: optionalText,
  status: studentStatusSchema,
  medicalNotes: optionalText,
  emergencyNotes: optionalText,
  doctorName: optionalText,
  doctorPhone: optionalText,
  medicalConditions: optionalText,
  medicationNotes: optionalText,
  dietaryRequirements: optionalText,
  emergencyMedicalConsent: z.coerce.boolean().default(false),
  allergyName: optionalText,
  allergySeverity: z.enum(["", "unknown", "mild", "moderate", "severe"]).transform((value) => (value === "" ? null : value)),
  allergyReaction: optionalText,
  emergencyContactName: optionalText,
  emergencyContactRelationship: optionalText,
  emergencyContactPhone: optionalText,
  parentName: optionalText,
  parentEmail: optionalText.pipe(z.string().email().nullable()).or(z.null()),
  parentPhone: optionalText,
  parentRelationshipType: z.enum(["mother", "father", "guardian", "grandparent", "other"]).default("guardian"),
});

export const studentListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  status: z.enum(["all", "active", "inactive", "archived"]).optional().default("active"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["full_name", "student_number", "date_of_birth", "created_at", "status"]).optional().default("created_at"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const studentStatusFormSchema = z.object({
  status: studentStatusSchema,
  reason: z.string().trim().max(240).optional().default(""),
});

export type StudentFormInput = z.infer<typeof studentFormSchema>;
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
export type StudentStatusInput = z.infer<typeof studentStatusFormSchema>;
