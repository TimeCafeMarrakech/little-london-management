import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUserProfile } from "@/lib/auth/session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  await requireUserProfile();

  return <AppShell>{children}</AppShell>;
}
