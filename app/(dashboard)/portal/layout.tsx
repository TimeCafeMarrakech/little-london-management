import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { requireUserProfile } from "@/lib/auth/session";
import { assertParentPortalAccess } from "@/services/parent-portal/parent-portal-service";

type ParentPortalLayoutProps = {
  children: ReactNode;
};

export default async function ParentPortalLayout({ children }: ParentPortalLayoutProps) {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  try {
    await assertParentPortalAccess(profile);
  } catch {
    redirect("/access-denied?reason=parent-portal-disabled");
  }

  return children;
}
