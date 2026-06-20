import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUserProfile } from "@/lib/auth/session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const profile = await requireUserProfile();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
