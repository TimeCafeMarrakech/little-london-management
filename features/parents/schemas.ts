import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

export const parentStatusSchema = z.enum(["active", "inactive", "archived"]);
export const parentPortalStatusSchema = z.enum(["not_invited", "invited", "active", "disabled"]);
export const parentRelationshipTypeSchema = z.enum(["mother", "father", "guardian", "other"]);

export const parentFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: optionalText.pipe(z.string().email().nullable()).or(z.null()),
  phone: z.string().trim().min(3, "Phone is required.").max(40),
  alternatePhone: optionalText,
  addressLine1: optionalText,
  addressLine2: optionalText,
  city: optionalText,
  country: z.string().trim().min(1).default("Morocco"),
  preferredLanguage: optionalText,
  portalStatus: parentPortalStatusSchema,
  status: parentStatusSchema,
});

export const parentListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  status: z.enum(["all", "active", "inactive", "archived"]).optional().default("active"),
  portalStatus: z.enum(["all", "not_invited", "invited", "active", "disabled"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["full_name", "email", "created_at", "updated_at", "status"]).optional().default("created_at"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const parentStatusFormSchema = z.object({
  status: parentStatusSchema,
  reason: z.string().trim().max(240).optional().default(""),
});

export const parentRelationshipLinkSchema = z.object({
  parentId: z.string().uuid(),
  studentId: z.string().uuid("Choose a student to link."),
  relationshipType: parentRelationshipTypeSchema,
});

export const parentRelationshipUpdateSchema = z.object({
  parentId: z.string().uuid(),
  relationshipId: z.string().uuid(),
  relationshipType: parentRelationshipTypeSchema,
});

export const parentRelationshipUnlinkSchema = z.object({
  parentId: z.string().uuid(),
  relationshipId: z.string().uuid(),
});

export type ParentFormInput = z.infer<typeof parentFormSchema>;
export type ParentListQuery = z.infer<typeof parentListQuerySchema>;
export type ParentStatusInput = z.infer<typeof parentStatusFormSchema>;
export type ParentRelationshipLinkInput = z.infer<typeof parentRelationshipLinkSchema>;
export type ParentRelationshipUpdateInput = z.infer<typeof parentRelationshipUpdateSchema>;
export type ParentRelationshipUnlinkInput = z.infer<typeof parentRelationshipUnlinkSchema>;
