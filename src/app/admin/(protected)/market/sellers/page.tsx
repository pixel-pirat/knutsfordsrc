import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  countSellersForAdmin,
  listSellersForAdmin,
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

export default async function RegisteredSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const page = parsePage(params.page);

  const [sellers, total] = await Promise.all([
    listSellersForAdmin({
      q,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countSellersForAdmin(q),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Registered Sellers
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Students approved to operate a store on the marketplace
        </p>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name, index number or store"
          className="h-9 min-w-56 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus:border-gold dark:border-white/10 dark:text-neutral-100"
        />
        <button
          type="submit"
          className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Search
        </button>
        {q && (
          <Link
            href="/admin/market/sellers"
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
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Approved</th>
                <th className="px-5 py-3">Store status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {sellers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No approved sellers yet.
                  </td>
                </tr>
              )}
              {sellers.map((seller) => (
                <tr
                  key={seller.applicationId}
                  className="border-b border-black/5 last:border-0 dark:border-white/10"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink dark:text-neutral-100">
                      {seller.studentFirstName} {seller.studentLastName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {seller.indexNumber}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                    {seller.storeName}
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                    {CATEGORY_LABELS[seller.category] ?? seller.category}
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                    {seller.approvedAt
                      ? formatMarketplaceDate(seller.approvedAt)
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {seller.storeId ? (
                      <Badge
                        variant="outline"
                        className={
                          STORE_STATUS_STYLES[seller.storeStatus ?? "active"]
                        }
                      >
                        {STORE_STATUS_LABELS[seller.storeStatus ?? "active"]}
                      </Badge>
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        Store not created
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {seller.storeId ? (
                      <Link
                        href={`/admin/market/stores/${seller.storeId}`}
                        className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
                      >
                        View store
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/market/applications/${seller.applicationId}`}
                        className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
                      >
                        View application
                      </Link>
                    )}
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
          basePath="/admin/market/sellers"
          searchParams={{ q }}
        />
      </div>
    </div>
  );
}
