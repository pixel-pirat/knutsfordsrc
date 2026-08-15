type AuditEntry = {
  action: string;
  targetType: string;
  metadata: unknown;
};

function meta(entry: AuditEntry): Record<string, unknown> {
  return (entry.metadata as Record<string, unknown>) ?? {};
}

export function describeAuditEntry(entry: AuditEntry): string {
  const m = meta(entry);

  switch (entry.action) {
    case "admin.bootstrap":
      return `Set up the super admin account (${m.email ?? ""})`;
    case "admin.create":
      return `Created a new admin account (${m.email ?? ""})`;
    case "admin.update":
      return "active" in m
        ? `${m.active ? "Reactivated" : "Deactivated"} an admin account`
        : "Updated an admin account's permissions";
    case "student.create":
      return `Registered student ${m.firstName ?? ""} ${m.lastName ?? ""} (${
        m.indexNumber ?? ""
      })${m.viaPermitIssuance ? " while issuing a permit" : ""}`;
    case "permit.issue":
      return `Issued permit ${m.referenceNumber ?? ""}${
        m.amount ? ` for GHS ${m.amount}` : ""
      } to ${m.studentIndexNumber ?? "a student"}`;
    default:
      return `${entry.action} — ${entry.targetType}`;
  }
}
