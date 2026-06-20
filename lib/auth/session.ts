import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth/routes";
import type { AccountStatus, UserProfile, UserRole } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

type RoleRow = {
  id: string;
  name: UserRole;
  display_name: string;
  status: "active" | "inactive" | "archived";
};

type UserProfileRow = {
  id: string;
  branch_id: string | null;
  role_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: AccountStatus;
  roles: RoleRow | RoleRow[] | null;
};

type RolePermissionRow = {
  permissions: {
    key: string;
  } | null;
};

function firstRole(role: RoleRow | RoleRow[] | null): RoleRow | null {
  if (Array.isArray(role)) {
    return role[0] ?? null;
  }

  return role;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, branch_id, role_id, full_name, email, phone, status, roles(id, name, display_name, status)")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    return null;
  }

  const profile = profileData as UserProfileRow;
  const role = firstRole(profile.roles);

  if (!role || role.status !== "active" || profile.status !== "active") {
    return null;
  }

  const { data: permissionData } = await supabase
    .from("role_permissions")
    .select("permissions(key)")
    .eq("role_id", profile.role_id);

  const permissions = ((permissionData ?? []) as RolePermissionRow[])
    .map((row) => row.permissions?.key)
    .filter((permissionKey): permissionKey is string => Boolean(permissionKey));

  return {
    id: profile.id,
    branchId: profile.branch_id,
    roleId: profile.role_id,
    role: role.name,
    roleDisplayName: role.display_name,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    status: profile.status,
    permissions,
  };
}

export async function requireUserProfile(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?reason=session-required");
  }

  return profile;
}

export async function redirectAuthenticatedUser(): Promise<void> {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect(getRoleLandingPath(profile.role));
  }
}
