export const ORDER_STATUS_VALUES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "fulfilled",
  "cancelled",
] as const;

export const PAYMENT_STATUS_VALUES = [
  "unpaid",
  "pending_confirmation",
  "paid",
  "refunded",
] as const;

export type MarketplaceOrderStatus = (typeof ORDER_STATUS_VALUES)[number];
export type MarketplacePaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

const ORDER_TRANSITIONS: Record<MarketplaceOrderStatus, MarketplaceOrderStatus[]> =
  {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["fulfilled", "cancelled"],
    fulfilled: [],
    cancelled: [],
  };

export function allowedOrderStatuses(
  status: string
): MarketplaceOrderStatus[] {
  if (!(status in ORDER_TRANSITIONS)) return [];
  return ORDER_TRANSITIONS[status as MarketplaceOrderStatus];
}

export function canTransitionOrder(from: string, to: string) {
  return allowedOrderStatuses(from).includes(to as MarketplaceOrderStatus);
}

export function isTerminalOrderStatus(status: string) {
  return status === "fulfilled" || status === "cancelled";
}
