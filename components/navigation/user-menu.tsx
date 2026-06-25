import { UserRound } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { roleLabels } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";

type UserMenuProps = {
  profile: UserProfile;
};

export function UserMenu({ profile }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white px-3 py-2 shadow-[0_12px_30px_rgba(15,45,71,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6d6cc] text-[#0f2d47] shadow-inner-soft" aria-hidden="true">
        <UserRound className="h-5 w-5" />
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold leading-5 text-[#0f2d47]">{profile.fullName}</p>
        <p className="text-xs text-[#5b6f82]">{roleLabels[profile.role]}</p>
      </div>
      <LogoutButton />
    </div>
  );
}
