import { Button } from "@/components/ui/button";
import type { AttendanceListQuery } from "@/features/attendance/schemas";
import type { AttendanceClassOption } from "@/features/attendance/types";

type AttendanceFiltersProps = {
  filters: AttendanceListQuery;
  classes: AttendanceClassOption[];
};

export function AttendanceFilters({ filters, classes }: AttendanceFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_180px_150px_150px_150px_110px] xl:items-end">
        <label className="block">
          <span className="text-sm font-medium">Search</span>
          <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.query} name="query" placeholder="Status or class" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Class</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.classId} name="classId">
            <option value="">All classes</option>
            {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm capitalize outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.status} name="status">
            {["all", "draft", "submitted", "reviewed", "locked", "archived"].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">From</span>
          <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.dateFrom} name="dateFrom" type="date" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">To</span>
          <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.dateTo} name="dateTo" type="date" />
        </label>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}
