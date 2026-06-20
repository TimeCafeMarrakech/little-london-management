import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudentListQuery } from "@/features/students/schemas";

type StudentFiltersProps = {
  filters: StudentListQuery;
};

export function StudentFilters({ filters }: StudentFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft" action="/students">
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_120px]">
        <label className="relative">
          <span className="sr-only">Search students</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            defaultValue={filters.query}
            name="query"
            placeholder="Search by name, number, or school"
            type="search"
          />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.status} name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
            <option value="all">All students</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort by</span>
          <select className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.sort} name="sort">
            <option value="created_at">Newest</option>
            <option value="full_name">Name</option>
            <option value="student_number">Student number</option>
            <option value="date_of_birth">Date of birth</option>
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
