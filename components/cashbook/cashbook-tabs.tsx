import Link from "next/link";

type CashbookTabsProps = {
  active: "income" | "expenses" | "targets" | "performance" | "reports";
};

export function CashbookTabs({ active }: CashbookTabsProps) {
  const tabs = [
    { id: "income" as const, label: "Daily Income", href: "/cashbook" },
    { id: "expenses" as const, label: "Expenses", href: "/cashbook/expenses" },
    { id: "targets" as const, label: "Targets", href: "/cashbook/targets" },
    { id: "performance" as const, label: "Performance", href: "/cashbook/performance" },
    { id: "reports" as const, label: "Reports", href: "/cashbook/reports" },
  ];

  return (
    <nav className="flex flex-wrap gap-2 rounded-[1.25rem] border border-[#eadfce] bg-white/88 p-2 shadow-[0_12px_28px_rgba(15,45,71,0.06)]" aria-label="Cashbook sections">
      {tabs.map((tab) => (
        <Link
          aria-current={active === tab.id ? "page" : undefined}
          className={
            active === tab.id
              ? "rounded-2xl bg-[#f24a3a] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_22px_rgba(242,74,58,0.2)]"
              : "rounded-2xl px-4 py-2 text-sm font-semibold text-[#5b6f82] hover:bg-[#fff8ee] hover:text-[#0f2d47]"
          }
          href={tab.href}
          key={tab.id}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
