import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Flag } from "lucide-react";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { getSellerComplaints } from "@/db/complaintQueries";
import { ComplaintStatusBadge } from "@/components/market/ComplaintStatusBadge";
import {
  COMPLAINT_CATEGORY_LABELS,
  formatMarketplaceDate,
} from "@/lib/marketplace";
import { SellerNav } from "../SellerNav";

export const dynamic = "force-dynamic";

export default async function SellerComplaintsPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  const complaints = await getSellerComplaints(store.id);

  return (
    <div>
      <SellerNav />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Complaints
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Buyer reports filed against {store.name}. Respond with context so
          the SRC can resolve them quickly.
        </p>
      </div>

      {complaints.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
            <Flag className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-ink dark:text-neutral-100">
            No complaints
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            No buyer has filed a complaint against your store.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <Link
              key={complaint.id}
              href={`/dashboard/store/complaints/${complaint.referenceNumber}`}
              className="block rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-shadow hover:shadow-md dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-ink dark:text-neutral-100">
                      {complaint.referenceNumber}
                    </p>
                    <ComplaintStatusBadge status={complaint.status} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink dark:text-neutral-100">
                    {complaint.subject}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {COMPLAINT_CATEGORY_LABELS[complaint.category] ??
                      complaint.category}{" "}
                    · {complaint.complainantName} · Order{" "}
                    {complaint.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Filed {formatMarketplaceDate(complaint.createdAt)}
                  </p>
                </div>
                <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gold-dark dark:text-gold-light">
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
