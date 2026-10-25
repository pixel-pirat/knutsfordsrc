import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  getApplicationForStudent,
  getStoreDetail,
} from "@/db/marketplaceQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import {
  CATEGORY_LABELS,
  FULFILMENT_LABELS,
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
  formatMarketplaceDateTime,
} from "@/lib/marketplace";
import { StoreStatusPanel } from "./StoreStatusPanel";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const detail = await getStoreDetail(id);
  if (!detail) notFound();

  const { store, student } = detail;
  const application = await getApplicationForStudent(student.id);

  return (
    <div>
      <Link
        href="/admin/market/stores"
        className="text-sm font-medium text-gold-dark hover:underline dark:text-gold-light"
      >
        ← Store Management
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
              <Image
                src={store.logoUrl}
                alt={`${store.name} logo`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-lg font-extrabold text-gold-dark dark:text-gold-light">
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
              {store.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              /market/store/{store.slug}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-sm ${STORE_STATUS_STYLES[store.status]}`}
        >
          {STORE_STATUS_LABELS[store.status] ?? store.status}
        </Badge>
      </div>

      {store.status === "suspended" && store.statusReason && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
          Suspended: {store.statusReason}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Store details
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Category">
                {CATEGORY_LABELS[store.category] ?? store.category}
              </Detail>
              <Detail label="Operating hours">
                {store.operatingHours || "—"}
              </Detail>
              <Detail label="Contact email">{store.contactEmail || "—"}</Detail>
              <Detail label="Contact phone">{store.contactPhone || "—"}</Detail>
              <Detail label="Fulfilment">
                {store.fulfilmentMethods
                  .map((method) => FULFILMENT_LABELS[method] ?? method)
                  .join(", ") || "—"}
              </Detail>
              <Detail label="Pickup location">
                {store.pickupLocation || "—"}
              </Detail>
              <Detail label="Created">
                {formatMarketplaceDateTime(store.createdAt)}
              </Detail>
              <Detail label="Last updated">
                {formatMarketplaceDateTime(store.updatedAt)}
              </Detail>
            </dl>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Description
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {store.description || "No description provided."}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Owner
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <UserAvatar
                name={`${student.firstName} ${student.lastName}`}
                avatarUrl={student.avatarUrl}
                size="default"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                  {student.firstName} {student.lastName}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {student.indexNumber}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Detail label="Email">{student.email ?? "—"}</Detail>
              <Detail label="Phone">{student.phone ?? "—"}</Detail>
              <Detail label="Programme">{student.program ?? "—"}</Detail>
              <Detail label="Level">
                {student.level ? `Level ${student.level}` : "—"}
              </Detail>
            </dl>
            <div className="mt-4 flex flex-col gap-1.5 text-xs font-semibold">
              <Link
                href={`/admin/students/${student.id}`}
                className="text-gold-dark hover:underline dark:text-gold-light"
              >
                View student record
              </Link>
              {application && (
                <Link
                  href={`/admin/market/applications/${application.id}`}
                  className="text-gold-dark hover:underline dark:text-gold-light"
                >
                  View seller application
                </Link>
              )}
            </div>
          </section>

          <StoreStatusPanel
            storeId={store.id}
            status={store.status}
            existingReason={store.statusReason}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
        {children}
      </dd>
    </div>
  );
}
