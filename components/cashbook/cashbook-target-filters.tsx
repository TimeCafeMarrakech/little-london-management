"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CashbookTargetListQuery } from "@/features/cashbook/schemas";
import type { CashbookOption } from "@/features/cashbook/types";

type CashbookTargetFiltersProps = {
  filters: CashbookTargetListQuery;
  businessAreas: CashbookOption[];
};

function monthValue(value: string): string {
  return value ? value.slice(0, 7) : "";
}

export function CashbookTargetFilters({ filters, businessAreas }: CashbookTargetFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());

    ["query", "targetType", "businessAreaId", "status"].forEach((key) => {
      params.set(key, String(formData.get(key) ?? ""));
    });

    const targetMonth = String(formData.get("targetMonth") ?? "");
    params.set("targetMonth", targetMonth ? `${targetMonth}-01` : "");
    params.set("page", "1");
    router.push(`/cashbook/targets?${params.toString()}`);
  }

  return (
    <form action={applyFilters} className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_16px_38px_rgba(15,45,71,0.07)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="block xl:col-span-2">
          <span className="text-sm font-semibold text-[#0f2d47]">Search</span>
          <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.query} name="query" placeholder="Search notes" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">Month</span>
          <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={monthValue(filters.targetMonth)} name="targetMonth" type="month" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">Target Type</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.targetType} name="targetType">
            <option value="all">All types</option>
            <option value="revenue">Revenue</option>
            <option value="profit">Profit</option>
            <option value="expense_budget">Expense Budget</option>
            <option value="active_students">Active Students</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">Status</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.status} name="status">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All non-archived</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">Business Area</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.businessAreaId} name="businessAreaId">
            <option value="all">All business areas</option>
            {businessAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button className="rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]" type="submit">Apply filters</Button>
        <Button className="rounded-2xl" onClick={() => router.push("/cashbook/targets")} type="button" variant="outline">Reset</Button>
      </div>
    </form>
  );
}
