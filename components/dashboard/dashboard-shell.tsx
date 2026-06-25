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
    <div className="min-h-screen bg-[#fff8ee] bg-[radial-gradient(circle_at_top_left,rgba(242,74,58,0.10),transparent_28rem),radial-gradient(circle_at_top_right,rgba(140,201,168,0.28),transparent_24rem)]">
      <Sidebar profile={profile} />
      <Header profile={profile} />
      <main className="px-4 py-7 lg:ml-[344px] lg:px-7">
        <div className="mx-auto max-w-[1540px]">{children}</div>
      </main>
    </div>
  );
}
