import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PermitIssuanceFlow } from "./PermitIssuanceFlow";

export default async function IssuePermitPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "issue_permit")) {
    return <AccessRestricted />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Issue Permit
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Look up a student by index number, or create their profile on the spot
        </p>
      </div>
      <PermitIssuanceFlow canCreateStudent={hasPermission(admin, "create_student")} />
    </div>
  );
}
