import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  countApplicationsForAdmin,
  listApplicationsForAdmin,
  type ApplicationStatus,
  type MarketplaceCategory,
} from "@/db/marketplaceQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/Pagination";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  CATEGORY_LABELS,
  formatMarketplaceDate,
} from "@/lib/marketplace";

const STATUS_VALUES: ApplicationStatus[] = [
  "pending_review",
  "under_review",
  "additional_info_required",
  "approved",
  "rejected",
];

const CATEGORY_VALUES: MarketplaceCategory[] = ["products", "services", "both"];

export default async function StoreApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = STATUS_VALUES.includes(params.status as ApplicationStatus)
    ? (params.status as ApplicationStatus)
    : undefined;
  const category = CATEGORY_VALUES.includes(params.category as MarketplaceCategory)
    ? (params.category as MarketplaceCategory)
    : undefined;

  const page = parsePage(params.page);
  const filters = { q, status, category };

  const [applications, total] = await Promise.all([
    listApplicationsForAdmin({
      filters,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countApplicationsForAdmin(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Store Applications
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Review seller applications and approve students to open a store
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
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All statuses</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {APPLICATION_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="h-9 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All categories</option>
          {CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Filter
        </button>
        {(q || status || category) && (
          <Link
            href="/admin/market/applications"
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
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No applications match these filters.
                  </td>
                </tr>
              )}
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/10"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink dark:text-neutral-100">
                      {application.studentFirstName} {application.studentLastName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {application.indexNumber}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                    <Link
                      href={`/admin/market/applications/${application.id}`}
                      className="font-medium hover:text-gold-dark hover:underline dark:hover:text-gold-light"
                    >
                      {application.storeName}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                    {CATEGORY_LABELS[application.category] ?? application.category}
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                    {formatMarketplaceDate(application.submittedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={APPLICATION_STATUS_STYLES[application.status]}
                    >
                      {APPLICATION_STATUS_LABELS[application.status] ??
                        application.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/market/applications/${application.id}`}
                      className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
                    >
                      Review
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
          basePath="/admin/market/applications"
          searchParams={{ q, status, category }}
        />
      </div>
    </div>
  );
}
