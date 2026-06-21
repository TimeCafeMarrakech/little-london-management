"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent } from "react";

import { Button } from "@/components/ui/button";

type FinanceFiltersProps = {
  query: string;
  selectName: string;
  selectLabel: string;
  selectValue: string;
  selectOptions: Array<{ value: string; label: string }>;
  placeholder: string;
};

export function FinanceFilters({ query, selectName, selectLabel, selectValue, selectOptions, placeholder }: FinanceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    params.set("query", String(formData.get("query") ?? ""));
    params.set(selectName, String(formData.get(selectName) ?? "all"));
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <form className="rounded-lg border bg-card p-4 shadow-soft" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
        <label className="block">
          <span className="text-sm font-medium">Search</span>
          <input
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue={query}
            name="query"
            placeholder={placeholder}
            type="search"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{selectLabel}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            defaultValue={selectValue}
            name={selectName}
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}
