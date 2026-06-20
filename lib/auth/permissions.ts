import type { UserProfile, UserRole } from "@/lib/auth/types";

export function hasPermission(profile: UserProfile | null, permissionKey: string): boolean {
  return Boolean(profile?.permissions.includes(permissionKey));
}

export function hasAnyPermission(profile: UserProfile | null, permissionKeys: string[]): boolean {
  return permissionKeys.some((permissionKey) => hasPermission(profile, permissionKey));
}

export function hasRole(profile: UserProfile | null, roles: UserRole[]): boolean {
  return Boolean(profile && roles.includes(profile.role));
}

export function isManagementRole(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}
