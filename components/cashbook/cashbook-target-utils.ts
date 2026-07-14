import type { CashbookTargetProgress, CashbookTargetType } from "@/features/cashbook/types";

export function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

export function formatTargetType(type: CashbookTargetType): string {
  const labels: Record<CashbookTargetType, string> = {
    revenue: "Revenue",
    profit: "Profit",
    expense_budget: "Expense Budget",
    active_students: "Active Students",
  };

  return labels[type];
}

export function formatTargetValue(type: CashbookTargetType, value: number): string {
  return type === "active_students" ? formatNumber(value) : formatMoney(value);
}

export function statusClass(status: CashbookTargetProgress["targetStatus"]): string {
  if (status === "No target") {
    return "bg-[#f3f0ea] text-[#5b6f82]";
  }

  if (status === "Achieved") {
    return "bg-[#e6f4ec] text-[#24734d]";
  }

  if (status === "On Track") {
    return "bg-[#ddeaf5] text-[#0f2d47]";
  }

  if (status === "Needs Attention") {
    return "bg-[#fff2cf] text-[#9b6b0f]";
  }

  return "bg-[#ffe4df] text-[#c53227]";
}
