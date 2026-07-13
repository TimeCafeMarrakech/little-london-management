import { CashbookIncomeForm } from "@/components/cashbook/cashbook-income-form";
import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canCreateCashbookIncome,
  listCashbookBusinessAreas,
  listCashbookIncomeCategories,
  listCashbookParents,
  listCashbookStudents,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

export default async function NewCashbookIncomePage() {
  const profile = await requireUserProfile();

  if (!canCreateCashbookIncome(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to record daily income." />;
  }

  const [businessAreas, categories, parents, students] = await Promise.all([
    listCashbookBusinessAreas(profile),
    listCashbookIncomeCategories(profile),
    listCashbookParents(profile),
    listCashbookStudents(profile),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
        <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Record Income</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6f82]">
          Add non-invoice income such as Play & Learn childcare, drop-ins, workshops, snacks, or other daily income.
        </p>
      </section>
      <CashbookIncomeForm businessAreas={businessAreas} categories={categories} parents={parents} students={students} />
    </div>
  );
}
