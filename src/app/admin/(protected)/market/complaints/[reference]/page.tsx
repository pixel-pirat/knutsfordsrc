import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ShoppingBag, Store } from "lucide-react";
import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { getAdminComplaintByReference } from "@/db/complaintQueries";
import { ComplaintStatusBadge } from "@/components/market/ComplaintStatusBadge";
import { ComplaintTimeline } from "@/components/market/ComplaintTimeline";
import { ComplaintActionsPanel } from "@/components/market/ComplaintActionsPanel";
import {
  COMPLAINT_CATEGORY_LABELS,
  formatMarketplaceDateTime,
} from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function AdminComplaintDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const { reference } = await params;
  const complaint = await getAdminComplaintByReference(reference);
  if (!complaint) notFound();

  return (
    <div>
      <Link
        href="/admin/market/complaints"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Complaints &amp; Disputes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Complaint
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {complaint.referenceNumber}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <CalendarDays className="h-4 w-4" />
            {formatMarketplaceDateTime(complaint.createdAt)}
          </p>
        </div>
        <ComplaintStatusBadge status={complaint.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              {complaint.subject}
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              {COMPLAINT_CATEGORY_LABELS[complaint.category] ?? complaint.category}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
              {complaint.description}
            </p>
            {complaint.evidence && (
              <div className="mt-4 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600 ring-1 ring-black/5 dark:bg-neutral-800/60 dark:text-neutral-300 dark:ring-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Supporting evidence
                </p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed">
                  {complaint.evidence}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Parties
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Buyer
                </dt>
                <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                  {complaint.complainantName}
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {complaint.complainantPhone}
                    {complaint.complainantEmail
                      ? ` · ${complaint.complainantEmail}`
                      : ""}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Seller
                </dt>
                <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                  {complaint.sellerName}
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {complaint.sellerIndexNumber}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Order
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-ink dark:text-neutral-100">
                  <ShoppingBag className="h-4 w-4 text-neutral-400" />
                  <Link
                    href={`/admin/market/orders/${complaint.orderNumber}`}
                    className="text-gold-dark hover:underline dark:text-gold-light"
                  >
                    {complaint.orderNumber}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Store
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-ink dark:text-neutral-100">
                  <Store className="h-4 w-4 text-neutral-400" />
                  <Link
                    href={`/admin/market/stores/${complaint.storeId}`}
                    className="text-gold-dark hover:underline dark:text-gold-light"
                  >
                    {complaint.storeName}
                  </Link>
                </dd>
              </div>
            </dl>
          </section>

          {complaint.resolutionNotes && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
                {complaint.status === "resolved"
                  ? "Resolution notes"
                  : "Rejection reason"}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                {complaint.resolutionNotes}
              </p>
              {complaint.resolvedAt && (
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  {formatMarketplaceDateTime(complaint.resolvedAt)}
                </p>
              )}
            </section>
          )}

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Activity
            </h2>
            <div className="mt-4">
              <ComplaintTimeline events={complaint.events} />
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <ComplaintActionsPanel
            reference={complaint.referenceNumber}
            status={complaint.status}
            assignedAdminId={complaint.assignedAdminId}
            currentAdminId={admin.id}
          />
        </aside>
      </div>
    </div>
  );
}
