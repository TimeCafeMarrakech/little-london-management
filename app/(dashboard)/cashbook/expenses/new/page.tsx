import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookExpenseForm } from "@/components/cashbook/cashbook-expense-form";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canCreateCashbookExpenses,
  listCashbookBusinessAreas,
  listCashbookExpenseCategories,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

export default async function NewCashbookExpensePage() {
  const profile = await requireUserProfile();

  if (!canCreateCashbookExpenses(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to record expenses." />;
  }

  const [businessAreas, categories] = await Promise.all([
    listCashbookBusinessAreas(profile),
    listCashbookExpenseCategories(profile),
  ]);

  return (
    <div className="space-y-6">
      <CashbookTabs active="expenses" />
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
        <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Record Expense</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6f82]">
          Add daily business expenses such as salaries, rent, utilities, teaching materials, snacks, repairs, or marketing.
        </p>
      </section>
      <CashbookExpenseForm businessAreas={businessAreas} categories={categories} />
    </div>
  );
}
