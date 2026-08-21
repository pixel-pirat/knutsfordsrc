export type PermitStatus = "pending" | "active" | "expired";

export function getPermitStatus(permit: {
  cardStatus: string;
  expiresAt: Date | string | null;
}): PermitStatus {
  if (permit.expiresAt && new Date(permit.expiresAt).getTime() < Date.now()) {
    return "expired";
  }
  return permit.cardStatus === "active" ? "active" : "pending";
}

export const permitStatusBadge: Record<PermitStatus, string> = {
  active:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  expired:
    "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
};

export function formatCurrency(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "—";
  return `GHS ${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
