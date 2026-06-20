import Link from "next/link";
import { Plus } from "lucide-react";

import { ParentDashboardWidgets } from "@/components/parents/parent-dashboard-widgets";
import { ParentEmptyState } from "@/components/parents/parent-empty-state";
import { ParentErrorState } from "@/components/parents/parent-error-state";
import { ParentFilters } from "@/components/parents/parent-filters";
import { ParentProfileCard } from "@/components/parents/parent-profile-card";
import { Button } from "@/components/ui/button";
import { parentListQuerySchema } from "@/features/parents/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageParents, canReadParentModule, listParents } from "@/services/parents/parent-service";

export const dynamic = "force-dynamic";

type ParentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ParentsPage({ searchParams }: ParentsPageProps) {
  const profile = await requireUserProfile();

  if (!canReadParentModule(profile)) {
    return (
      <ParentErrorState
        title="Access denied"
        message="Parent management is available to Super Admins and Admins. Teacher and parent-specific views remain scoped placeholders."
      />
    );
  }

  const rawSearchParams = (await searchParams) ?? {};
  const filters = parentListQuerySchema.parse({
    query: firstValue(rawSearchParams.query),
    status: firstValue(rawSearchParams.status),
    portalStatus: firstValue(rawSearchParams.portalStatus),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
    sort: firstValue(rawSearchParams.sort),
    direction: firstValue(rawSearchParams.direction),
  });

  try {
    const result = await listParents(profile, filters);
    const canCreate = canManageParents(profile);
    const placeholderMode = !canCreate;

    return (
      <div className="space-y-7">
        <section className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Phase 5</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Parent management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage parent profiles, contact details, portal status, and normalized student relationships.
            </p>
          </div>
          {canCreate ? (
            <Button asChild>
              <Link href="/parents/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create parent
              </Link>
            </Button>
          ) : null}
        </section>

        <ParentDashboardWidgets metrics={result.metrics} />
        <ParentFilters filters={filters} />

        {result.parents.length > 0 ? (
          <section className="grid gap-5 xl:grid-cols-2" aria-label="Parent profiles">
            {result.parents.map((parent) => (
              <ParentProfileCard key={parent.id} parent={parent} />
            ))}
          </section>
        ) : (
          <ParentEmptyState canCreate={canCreate} placeholderMode={placeholderMode} />
        )}

        {result.totalPages > 1 ? (
          <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span>
              Page {result.page} of {result.totalPages}
            </span>
            <span>{result.totalRecords} records</span>
          </div>
        ) : null}
      </div>
    );
  } catch (error) {
    return (
      <ParentErrorState
        message={
          error instanceof Error && error.message.includes("relation")
            ? "The Phase 5 Supabase migration has not been applied yet. Apply the parent management migration, then reload this page."
            : "Parents could not be loaded. Please check the database connection and permissions."
        }
      />
    );
  }
}
