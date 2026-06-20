import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TeacherListQuery } from "@/features/teachers/schemas";

type TeacherFiltersProps = {
  filters: TeacherListQuery;
};

export function TeacherFilters({ filters }: TeacherFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="grid gap-3 lg:grid-cols-[1fr_160px_180px_160px_140px_auto]">
        <label className="relative block">
          <span className="sr-only">Search teachers</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue={filters.query}
            name="query"
            placeholder="Search teachers"
          />
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
          <span className="sr-only">Employment type</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue={filters.employmentType}
            name="employmentType"
          >
            <option value="all">All employment</option>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contractor">Contractor</option>
            <option value="substitute">Substitute</option>
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Sort</span>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.sort} name="sort">
            <option value="created_at">Created</option>
            <option value="full_name">Name</option>
            <option value="teacher_number">Teacher number</option>
            <option value="hire_date">Hire date</option>
            <option value="status">Status</option>
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
