import { ShieldCheck } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireUserProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireUserProfile();

  return (
    <section className="flex flex-1 items-center justify-center py-12">
      <div className="w-full max-w-3xl rounded-lg border bg-card p-8 text-card-foreground shadow-soft">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/25 px-3 py-1 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Protected route
        </div>
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">Authentication foundation ready</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          You are signed in as {profile.fullName} with the {profile.roleDisplayName} role. This page verifies session
          handling, user profile loading, role detection, and protected route access without implementing dashboard
          widgets or operational modules.
        </p>
        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-background px-4 py-3">
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm font-medium">{profile.email}</dd>
          </div>
          <div className="rounded-md border bg-background px-4 py-3">
            <dt className="text-sm text-muted-foreground">Permissions loaded</dt>
            <dd className="mt-1 text-sm font-medium">{profile.permissions.length}</dd>
          </div>
        </dl>
        <div className="mt-8">
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
