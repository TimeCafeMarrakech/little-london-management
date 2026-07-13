"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { CashbookIncomeListQuery } from "@/features/cashbook/schemas";
import type { CashbookOption } from "@/features/cashbook/types";

type CashbookFiltersProps = {
  filters: CashbookIncomeListQuery;
  businessAreas: CashbookOption[];
  categories: CashbookOption[];
};

export function CashbookFilters({ filters, businessAreas, categories }: CashbookFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    ["query", "dateFrom", "dateTo", "businessAreaId", "incomeCategoryId", "paymentMethod", "status"].forEach((key) => {
      params.set(key, String(formData.get(key) ?? ""));
    });

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <form className="rounded-[1.35rem] border border-[#eadfce] bg-white/88 p-5 shadow-[0_16px_40px_rgba(15,45,71,0.07)]" onSubmit={onSubmit}>
      <div className="grid gap-3 lg:grid-cols-6 lg:items-end">
        <label className="block lg:col-span-2">
          <span className="text-sm font-semibold text-[#0f2d47]">Search</span>
          <input
            className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15"
            defaultValue={filters.query}
            name="query"
            placeholder="Search description"
            type="search"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">From</span>
          <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.dateFrom} name="dateFrom" type="date" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">To</span>
          <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.dateTo} name="dateTo" type="date" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">Payment</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.paymentMethod} name="paymentMethod">
            <option value="all">All methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0f2d47]">Status</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.status} name="status">
            <option value="all">All active</option>
            <option value="recorded">Recorded</option>
            <option value="void">Void</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="text-sm font-semibold text-[#0f2d47]">Business Area</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.businessAreaId} name="businessAreaId">
            <option value="all">All business areas</option>
            {businessAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="text-sm font-semibold text-[#0f2d47]">Category</span>
          <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={filters.incomeCategoryId} name="incomeCategoryId">
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </label>
        <div className="lg:col-span-2">
          <Button className="h-11 w-full rounded-2xl bg-[#f24a3a] text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]" type="submit">Apply filters</Button>
        </div>
      </div>
    </form>
  );
}
