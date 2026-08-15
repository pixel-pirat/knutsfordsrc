export const PERMISSIONS = [
  {
    key: "create_student",
    label: "Create Student Records",
    description: "Register new students, including inline during permit issuance",
  },
  {
    key: "issue_permit",
    label: "Issue Permits",
    description: "Issue permits to students",
  },
  {
    key: "view_students",
    label: "View Student Records",
    description: "Search and view the student directory",
  },
  {
    key: "view_permits",
    label: "View Permits",
    description: "View issued permits",
  },
  {
    key: "view_audit_log",
    label: "View Audit Trail",
    description: "View the full activity log of admin actions",
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export function hasPermission(
  admin: { role: string; permissions: string[] },
  permission: PermissionKey
) {
  if (admin.role === "super_admin") return true;
  return admin.permissions.includes(permission);
}
