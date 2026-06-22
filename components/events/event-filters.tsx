"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { EventListQuery } from "@/features/events/schemas";

type EventFiltersProps = {
  filters: EventListQuery;
};

export function EventFilters({ filters }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    ["query", "category", "status", "dateFrom", "dateTo"].forEach((key) => {
      params.set(key, String(formData.get(key) ?? ""));
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_180px_160px_160px_160px_auto] xl:items-end">
        <label className="block">
          <span className="text-sm font-medium">Search</span>
          <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.query} name="query" placeholder="Search events" type="search" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.category} name="category">
            <option value="all">All categories</option>
            <option value="workshop">Workshop</option>
            <option value="holiday_camp">Holiday camp</option>
            <option value="birthday_event">Birthday event</option>
            <option value="drama_event">Drama event</option>
            <option value="seasonal_event">Seasonal event</option>
            <option value="drop_play">Drop and play</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={filters.status} name="status">
            <option value="all">All active</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
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
