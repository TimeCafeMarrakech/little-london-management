import type { ReactNode } from "react";

import { Header } from "@/components/navigation/header";
import { Sidebar } from "@/components/navigation/sidebar";
import type { UserProfile } from "@/lib/auth/types";

type DashboardShellProps = {
  children: ReactNode;
  profile: UserProfile;
};

export function DashboardShell({ children, profile }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar profile={profile} />
      <Header profile={profile} />
      <main className="px-4 py-6 lg:ml-72 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
