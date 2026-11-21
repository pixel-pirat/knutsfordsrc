import { getCurrentAdmin, listExpenses, countExpenses, getTotalExpenses } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { formatCurrency } from "@/lib/permits";
import { ExpensesTable } from "./ExpensesTable";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const [expenses, total, totalAmount] = await Promise.all([
    listExpenses({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countExpenses(),
    getTotalExpenses(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">Expenses</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Log operating expenses — these are deducted from dues revenue on the Overview and
          Permit / Dues Analytics pages.
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
        <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          {formatCurrency(totalAmount)}
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Total expenses logged ({total})
        </p>
      </div>

      <ExpensesTable
        expenses={expenses.map((e) => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
          category: e.category,
          notes: e.notes,
          incurredAt: e.incurredAt.toISOString(),
          creatorName: e.creator?.name ?? null,
        }))}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
      />
    </div>
  );
}
