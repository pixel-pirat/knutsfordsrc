import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  countStoresForAdmin,
  listStoresForAdmin,
  type StoreStatus,
} from "@/db/marketplaceQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/Pagination";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import {
  CATEGORY_LABELS,
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
  formatMarketplaceDate,
} from "@/lib/marketplace";

const STATUS_VALUES: StoreStatus[] = [
  "active",
  "inactive",
  "suspended",
  "closed",
];

export default async function StoreManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = STATUS_VALUES.includes(params.status as StoreStatus)
    ? (params.status as StoreStatus)
    : undefined;
  const page = parsePage(params.page);

  const [stores, total] = await Promise.all([
    listStoresForAdmin({
      filters: { q, status },
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countStoresForAdmin({ q, status }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Store Management
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Monitor and moderate student-owned stores
        </p>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search student, index number or store"
          className="h-9 min-w-56 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus:border-gold dark:border-white/10 dark:text-neutral-100"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All statuses</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {STORE_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Filter
        </button>
        {(q || status) && (
          <Link
            href="/admin/market/stores"
            className="text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No stores match these filters.
                  </td>
                </tr>
              )}
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/10"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/market/stores/${store.id}`}
                      className="font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                    >
                      {store.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {store.studentFirstName} {store.studentLastName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {store.indexNumber}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                    {CATEGORY_LABELS[store.category] ?? store.category}
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                    {formatMarketplaceDate(store.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={STORE_STATUS_STYLES[store.status]}
                    >
                      {STORE_STATUS_LABELS[store.status] ?? store.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/market/stores/${store.id}`}
                      className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          basePath="/admin/market/stores"
          searchParams={{ q, status }}
        />
      </div>
    </div>
  );
}
