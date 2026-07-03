"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  parentFormSchema,
  parentRelationshipLinkSchema,
  parentRelationshipUnlinkSchema,
  parentRelationshipUpdateSchema,
  parentStatusFormSchema,
} from "@/features/parents/schemas";
import type { ParentActionState } from "@/features/parents/types";
import { requireUserProfile } from "@/lib/auth/session";
import {
  createParent,
  disableParentPortalAccess,
  enableParentPortalAccess,
  inviteParentToPortal,
  linkStudentToParent,
  sendParentPortalPasswordReset,
  unlinkStudentFromParent,
  updateParent,
  updateParentStatus,
  updateParentStudentRelationship,
} from "@/services/parents/parent-service";

const defaultErrorMessage = "Something went wrong. Please review the details and try again.";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function validationState(message: string, fieldErrors?: Record<string, string[]>): ParentActionState {
  return {
    success: false,
    message,
    fieldErrors,
  };
}

function errorState(error: unknown): ParentActionState {
  const message = error instanceof Error ? error.message : defaultErrorMessage;

  if (message === "forbidden") {
    return validationState("You do not have permission to manage parents.");
  }

  if (message === "duplicate_parent_student_relationship") {
    return validationState("This student is already linked to this parent.");
  }

  if (message === "parent_not_found") {
    return validationState("Parent profile could not be found.");
  }

  if (message === "student_not_found") {
    return validationState("Student profile could not be found or is archived.");
  }

  if (message === "parent_archived") {
    return validationState("Archived parents cannot use portal access.");
  }

  if (message === "parent_inactive") {
    return validationState("Only active parents can use portal access.");
  }

  if (message === "parent_email_required") {
    return validationState("Add a parent email address before managing portal access.");
  }

  if (message === "portal_account_missing") {
    return validationState("Create or invite the portal account before using this action.");
  }

  if (message === "parent_role_missing") {
    return validationState("The Parent role is missing or inactive in Supabase.");
  }

  if (message === "supabase_admin_not_configured") {
    return validationState("Supabase service role access is not configured. Add SUPABASE_SERVICE_ROLE_KEY before inviting portal users.");
  }

  if (message === "portal_auth_lookup_failed") {
    return validationState("Unable to verify the parent portal account in Supabase Auth. Please try again or check Supabase Auth configuration.");
  }

  if (message === "portal_invitation_failed") {
    return validationState("Unable to send the parent portal invitation. Please check the parent email and Supabase Auth email settings.");
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return validationState("A parent with this email or linked user already exists.");
  }

  return validationState(defaultErrorMessage);
}

export async function createParentAction(_previousState: ParentActionState, formData: FormData): Promise<ParentActionState> {
  const parsed = parentFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  let parentId: string;

  try {
    const profile = await requireUserProfile();
    parentId = await createParent(profile, parsed.data);
    revalidatePath("/parents");
  } catch (error) {
    return errorState(error);
  }

  redirect(`/parents/${parentId}`);
}

export async function updateParentAction(
  parentId: string,
  _previousState: ParentActionState,
  formData: FormData,
): Promise<ParentActionState> {
  const parsed = parentFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateParent(profile, parentId, parsed.data);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parentId}`);
  } catch (error) {
    return errorState(error);
  }

  redirect(`/parents/${parentId}`);
}

export async function updateParentStatusAction(
  parentId: string,
  _previousState: ParentActionState,
  formData: FormData,
): Promise<ParentActionState> {
  const parsed = parentStatusFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a valid parent status.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateParentStatus(profile, parentId, parsed.data);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parentId}`);

    return {
      success: true,
      message: "Parent status updated.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function linkStudentToParentAction(_previousState: ParentActionState, formData: FormData): Promise<ParentActionState> {
  const parsed = parentRelationshipLinkSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a student and relationship type.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await linkStudentToParent(profile, parsed.data);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parsed.data.parentId}`);

    return {
      success: true,
      message: "Student linked to parent.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateParentStudentRelationshipAction(
  _previousState: ParentActionState,
  formData: FormData,
): Promise<ParentActionState> {
  const parsed = parentRelationshipUpdateSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Please choose a valid relationship type.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await updateParentStudentRelationship(profile, parsed.data);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parsed.data.parentId}`);

    return {
      success: true,
      message: "Relationship updated.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function unlinkStudentFromParentAction(_previousState: ParentActionState, formData: FormData): Promise<ParentActionState> {
  const parsed = parentRelationshipUnlinkSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationState("Unable to unlink this student. Please reload and try again.", parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await requireUserProfile();
    await unlinkStudentFromParent(profile, parsed.data);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parsed.data.parentId}`);

    return {
      success: true,
      message: "Student unlinked from parent.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function inviteParentToPortalAction(parentId: string, _previousState: ParentActionState): Promise<ParentActionState> {
  void _previousState;

  try {
    const profile = await requireUserProfile();
    await inviteParentToPortal(profile, parentId);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parentId}`);

    return {
      success: true,
      message: "Parent portal invitation sent and account linked.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function resetParentPortalPasswordAction(parentId: string, _previousState: ParentActionState): Promise<ParentActionState> {
  void _previousState;

  try {
    const profile = await requireUserProfile();
    await sendParentPortalPasswordReset(profile, parentId);
    revalidatePath(`/parents/${parentId}`);

    return {
      success: true,
      message: "Password reset email sent.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function enableParentPortalAction(parentId: string, _previousState: ParentActionState): Promise<ParentActionState> {
  void _previousState;

  try {
    const profile = await requireUserProfile();
    await enableParentPortalAccess(profile, parentId);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parentId}`);

    return {
      success: true,
      message: "Parent portal access enabled.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function disableParentPortalAction(parentId: string, _previousState: ParentActionState): Promise<ParentActionState> {
  void _previousState;

  try {
    const profile = await requireUserProfile();
    await disableParentPortalAccess(profile, parentId);
    revalidatePath("/parents");
    revalidatePath(`/parents/${parentId}`);

    return {
      success: true,
      message: "Parent portal access disabled.",
    };
  } catch (error) {
    return errorState(error);
  }
}
