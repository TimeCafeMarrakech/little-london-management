import { Bell, ChevronDown, Globe2, Search } from "lucide-react";

import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { UserMenu } from "@/components/navigation/user-menu";
import type { UserProfile } from "@/lib/auth/types";

type HeaderProps = {
  profile: UserProfile;
};

export function Header({ profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfce]/80 bg-[#fffaf3]/90 px-4 py-3 backdrop-blur-xl lg:ml-[344px] lg:px-7">
      <div className="mx-auto flex max-w-[1540px] items-center gap-4">
        <MobileNavigation profile={profile} />
        <div className="hidden max-w-[645px] min-w-0 flex-1 items-center gap-4 rounded-2xl border border-[#eadfce] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,45,71,0.05)] md:flex">
          <Search className="h-4 w-4 text-[#5b6f82]" aria-hidden="true" />
          <span className="text-sm text-[#5f6f7f]">Search Little London operations...</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfce] bg-white p-3 text-[#0f2d47] shadow-[0_12px_30px_rgba(15,45,71,0.05)] transition hover:border-[#f24a3a]/30 hover:text-[#f24a3a] sm:flex"
            type="button"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f24a3a] px-1 text-[0.65rem] font-bold text-white">
              3
            </span>
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-semibold text-[#0f2d47] shadow-[0_12px_30px_rgba(15,45,71,0.05)] sm:flex">
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            English
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
