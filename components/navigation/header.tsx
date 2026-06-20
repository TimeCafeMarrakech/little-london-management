import { Search } from "lucide-react";

import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { UserMenu } from "@/components/navigation/user-menu";
import type { UserProfile } from "@/lib/auth/types";

type HeaderProps = {
  profile: UserProfile;
};

export function Header({ profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 px-4 py-4 backdrop-blur lg:ml-72 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <MobileNavigation profile={profile} />
        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border bg-card px-4 py-2 shadow-soft md:flex">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Search will arrive with future modules</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
