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
    case "event.create":
      return `Created event "${m.title ?? ""}"`;
    case "event.update":
      return `Updated event "${m.title ?? ""}"`;
    case "event.delete":
      return `Deleted event "${m.title ?? ""}"`;
    case "news.create":
      return `Published news post "${m.title ?? ""}"`;
    case "news.update":
      return `Updated news post "${m.title ?? ""}"`;
    case "news.delete":
      return `Deleted news post "${m.title ?? ""}"`;
    case "admin.update_profile":
      return "Updated their own profile";
    case "settings.update_contact_info":
      return "Updated site contact info";
    case "settings.update_semester":
      return `Set current semester to ${m.currentSemester ?? ""} (${m.academicYear ?? ""})`;
    case "settings.update_permit_config":
      return `Updated permit defaults (${m.currency ?? "GHS"} ${m.defaultAmount ?? ""})`;
    case "marketplace.application.start_review":
      return `Started reviewing store application "${m.storeName ?? ""}"`;
    case "marketplace.application.request_info":
      return `Requested more information for store application "${m.storeName ?? ""}"`;
    case "marketplace.application.approve":
      return `Approved store application "${m.storeName ?? ""}"`;
    case "marketplace.application.reject":
      return `Rejected store application "${m.storeName ?? ""}"`;
    case "marketplace.store.suspend":
      return `Suspended store "${m.storeName ?? ""}"`;
    case "marketplace.store.reactivate":
      return `Reactivated store "${m.storeName ?? ""}"`;
    case "marketplace.store.close":
      return `Closed store "${m.storeName ?? ""}"`;
    case "marketplace.listing.flag":
      return `Flagged marketplace listing "${m.name ?? ""}" from ${m.storeName ?? "a store"}`;
    case "marketplace.listing.remove":
      return `Removed marketplace listing "${m.name ?? ""}" from ${m.storeName ?? "a store"}`;
    case "marketplace.listing.restore":
      return `Restored marketplace listing "${m.name ?? ""}" from ${m.storeName ?? "a store"}`;
    default:
      return `${entry.action} — ${entry.targetType}`;
  }
}
