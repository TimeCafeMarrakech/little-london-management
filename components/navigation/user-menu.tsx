import { UserRound } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { roleLabels } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";

type UserMenuProps = {
  profile: UserProfile;
};

export function UserMenu({ profile }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-soft">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold leading-5">{profile.fullName}</p>
        <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/30 text-primary">
        <UserRound className="h-4 w-4" aria-hidden="true" />
      </div>
      <LogoutButton />
    </div>
  );
}
