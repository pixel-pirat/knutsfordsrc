import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PermitPopupForm } from "./PermitPopupForm";

export default async function IssuePermitPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "issue_permit")) {
    return <AccessRestricted />;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:items-center">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-7">
        <Link
          href="/admin/permits"
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-black/5 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </Link>

        <h1 className="text-lg font-extrabold text-ink sm:text-xl">Issue Permit</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Search for a student, confirm their details, then record the payment
        </p>

        <div className="mt-6">
          <PermitPopupForm />
        </div>
      </div>
    </div>
  );
}
