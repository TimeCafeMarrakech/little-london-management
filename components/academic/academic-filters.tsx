import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AcademicListQuery } from "@/features/academic/schemas";

type AcademicFiltersProps = {
  filters: AcademicListQuery;
  placeholder: string;
  sortOptions: Array<{ value: AcademicListQuery["sort"]; label: string }>;
};

export function AcademicFilters({ filters, placeholder, sortOptions }: AcademicFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_140px_auto]">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.query} name="query" placeholder={placeholder} />
        </label>
        <label className="block">
          <span className="sr-only">Status</span>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.status} name="status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Sort</span>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.sort} name="sort">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Direction</span>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.direction} name="direction">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}
