import { getCurrentAdmin, listPermits } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PermitsTable } from "./PermitsTable";

export default async function PermitsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_permits")) {
    return <AccessRestricted />;
  }

  const permits = await listPermits({ limit: 100 });

  return (
    <PermitsTable
      permits={permits.map((p) => ({
        id: p.id,
        referenceNumber: p.referenceNumber,
        amount: p.amount,
        cardStatus: p.cardStatus,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
        student: p.student,
        issuer: p.issuer,
      }))}
      canCreate={hasPermission(admin, "issue_permit")}
    />
  );
}
