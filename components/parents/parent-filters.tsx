import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ParentListQuery } from "@/features/parents/schemas";

type ParentFiltersProps = {
  filters: ParentListQuery;
};

export function ParentFilters({ filters }: ParentFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft" action="/parents">
      <div className="grid gap-3 xl:grid-cols-[1fr_170px_170px_170px_120px]">
        <label className="relative">
          <span className="sr-only">Search parents</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            defaultValue={filters.query}
            name="query"
            placeholder="Search by name, email, or phone"
            type="search"
          />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.status} name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
            <option value="all">All parents</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Portal status</span>
          <select className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.portalStatus} name="portalStatus">
            <option value="all">All portal states</option>
            <option value="not_invited">Not invited</option>
            <option value="invited">Invited</option>
            <option value="active">Portal active</option>
            <option value="disabled">Portal disabled</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort by</span>
          <select className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.sort} name="sort">
            <option value="created_at">Newest</option>
            <option value="full_name">Name</option>
            <option value="email">Email</option>
            <option value="updated_at">Recently updated</option>
            <option value="status">Status</option>
          </select>
        </label>
        <Button className="h-11" type="submit">
          Filter
        </Button>
      </div>
    </form>
  );
}
