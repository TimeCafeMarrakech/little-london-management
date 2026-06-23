import type { UserRole } from "@/lib/auth/types";

export const publicAuthRoutes = ["/login", "/forgot-password", "/reset-password", "/session-expired"] as const;

export const protectedRoutePrefixes = ["/dashboard", "/portal"] as const;

export function isProtectedPath(pathname: string): boolean {
  return protectedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAuthPath(pathname: string): boolean {
  return publicAuthRoutes.some((route) => pathname === route);
}

export function getRoleLandingPath(role: UserRole): string {
  const roleLandingPaths: Record<UserRole, string> = {
    super_admin: "/dashboard",
    admin: "/dashboard",
    teacher: "/dashboard",
    parent: "/dashboard",
  };

  return roleLandingPaths[role];
}
