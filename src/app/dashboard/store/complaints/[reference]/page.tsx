import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, ShoppingBag } from "lucide-react";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { getSellerComplaintByReference } from "@/db/complaintQueries";
import { ComplaintStatusBadge } from "@/components/market/ComplaintStatusBadge";
import { ComplaintTimeline } from "@/components/market/ComplaintTimeline";
import { SellerComplaintResponse } from "@/components/market/SellerComplaintResponse";
import {
  COMPLAINT_CATEGORY_LABELS,
  formatMarketplaceDateTime,
} from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function SellerComplaintDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  const { reference } = await params;
  const complaint = await getSellerComplaintByReference(store.id, reference);
  if (!complaint) notFound();

  return (
    <div>
      <Link
        href="/dashboard/store/complaints"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Complaints
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
                  Buyer&apos;s evidence
                </p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed">
                  {complaint.evidence}
                </p>
              </div>
            )}
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
              Filed by {complaint.complainantName} ({complaint.complainantPhone}
              {complaint.complainantEmail ? ` · ${complaint.complainantEmail}` : ""})
            </p>
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
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Respond
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Your response is shared with the SRC reviewing this complaint.
            </p>
            <div className="mt-3">
              <SellerComplaintResponse
                reference={complaint.referenceNumber}
                status={complaint.status}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Related order
            </h2>
            <Link
              href={`/dashboard/store/orders/${complaint.orderNumber}`}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:underline dark:text-gold-light"
            >
              <ShoppingBag className="h-4 w-4" />
              {complaint.orderNumber}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
