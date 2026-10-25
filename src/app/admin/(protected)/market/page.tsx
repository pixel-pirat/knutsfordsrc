import Link from "next/link";
import {
  Store,
  ClipboardCheck,
  UserCheck,
  Ban,
  ArrowRight,
} from "lucide-react";
import { getCurrentAdmin } from "@/db/adminQueries";
import { getMarketplaceOverview } from "@/db/marketplaceQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  CATEGORY_LABELS,
  formatMarketplaceDate,
} from "@/lib/marketplace";

const managementLinks = [
  {
    title: "Store Applications",
    description: "Review, approve or reject seller applications",
    href: "/admin/market/applications",
  },
  {
    title: "Registered Sellers",
    description: "Approved sellers and their store status",
    href: "/admin/market/sellers",
  },
  {
    title: "Store Management",
    description: "Monitor, restrict and suspend stores",
    href: "/admin/market/stores",
  },
  {
    title: "Products & Services",
    description: "Moderate marketplace listings (Phase 2)",
    href: "/admin/market/products",
  },
  {
    title: "Orders & Transactions",
    description: "Purchases and payment statuses (Phase 4)",
    href: "/admin/market/orders",
  },
  {
    title: "Complaints & Disputes",
    description: "Investigate and resolve reports (Phase 5)",
    href: "/admin/market/complaints",
  },
  {
    title: "Reviews & Reports",
    description: "Customer reviews and seller reports (later phase)",
    href: "/admin/market/reviews",
  },
  {
    title: "Marketplace Analytics",
    description: "Marketplace activity and performance",
    href: "/admin/market/analytics",
  },
];

export default async function MarketplaceOverviewPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const overview = await getMarketplaceOverview();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Marketplace
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Verify sellers and oversee student-owned stores
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Store} label="Registered Stores" value={overview.stores} />
        <StatCard
          icon={ClipboardCheck}
          label="Pending Applications"
          value={overview.pending}
        />
        <StatCard icon={UserCheck} label="Approved Sellers" value={overview.approved} />
        <StatCard icon={Ban} label="Suspended Stores" value={overview.suspended} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
              RECENT APPLICATIONS
            </h2>
            <Link
              href="/admin/market/applications"
              className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline"
            >
              View all
            </Link>
          </div>

          {overview.recentApplications.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No applications have been submitted yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5 dark:divide-white/10">
              {overview.recentApplications.map((application) => (
                <li key={application.id}>
                  <Link
                    href={`/admin/market/applications/${application.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                        {application.storeName}
                      </p>
                      <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {application.studentFirstName} {application.studentLastName}
                        {" · "}
                        {application.indexNumber}
                        {" · "}
                        {CATEGORY_LABELS[application.category] ?? application.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        {formatMarketplaceDate(application.submittedAt)}
                      </span>
                      <Badge
                        variant="outline"
                        className={APPLICATION_STATUS_STYLES[application.status]}
                      >
                        {APPLICATION_STATUS_LABELS[application.status] ??
                          application.status}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            MARKETPLACE MANAGEMENT
          </h2>
          <ul className="mt-4 space-y-2">
            {managementLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                      {link.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 dark:text-neutral-600" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 p-4 ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}
