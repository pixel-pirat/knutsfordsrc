import { getCurrentAdmin, listPermits, countPermits, type PermitStatusFilter } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { PermitsTable } from "./PermitsTable";

const STATUS_VALUES = new Set(["active", "pending", "expired"]);

export default async function PermitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_permits")) {
    return <AccessRestricted />;
  }

  const { q, status, page: pageParam } = await searchParams;
  const query = q?.trim() || undefined;
  const statusFilter = status && STATUS_VALUES.has(status) ? (status as PermitStatusFilter) : undefined;
  const page = parsePage(pageParam);

  const [permits, total] = await Promise.all([
    listPermits({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, query, status: statusFilter }),
    countPermits({ query, status: statusFilter }),
  ]);

  return (
    <PermitsTable
      permits={permits.map((p) => ({
        id: p.id,
        referenceNumber: p.referenceNumber,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        cardStatus: p.cardStatus,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
        student: p.student,
        issuer: p.issuer,
      }))}
      canCreate={hasPermission(admin, "issue_permit")}
      initialQuery={q ?? ""}
      initialStatus={status ?? "all"}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      total={total}
    />
  );
}
