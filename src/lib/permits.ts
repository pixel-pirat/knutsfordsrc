export type PermitStatus = "active" | "expired";

export function getPermitStatus(
  expiresAt: Date | string | null
): PermitStatus {
  if (!expiresAt) return "active";
  return new Date(expiresAt).getTime() < Date.now() ? "expired" : "active";
}

export function formatCurrency(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "—";
  return `GHS ${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
