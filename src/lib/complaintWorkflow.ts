export const COMPLAINT_CATEGORY_VALUES = [
  "product_not_delivered",
  "misleading_listing",
  "unavailable_product",
  "payment_dispute",
  "poor_service",
  "seller_misconduct",
  "refund_issue",
] as const;

export const COMPLAINT_STATUS_VALUES = [
  "open",
  "awaiting_seller_response",
  "under_investigation",
  "resolved",
  "rejected",
  "escalated",
] as const;

export type MarketplaceComplaintCategory =
  (typeof COMPLAINT_CATEGORY_VALUES)[number];
export type MarketplaceComplaintStatus =
  (typeof COMPLAINT_STATUS_VALUES)[number];

const COMPLAINT_TRANSITIONS: Record<
  MarketplaceComplaintStatus,
  MarketplaceComplaintStatus[]
> = {
  open: ["awaiting_seller_response", "under_investigation", "rejected"],
  awaiting_seller_response: ["under_investigation", "escalated", "rejected"],
  under_investigation: [
    "awaiting_seller_response",
    "resolved",
    "rejected",
    "escalated",
  ],
  escalated: ["under_investigation", "resolved", "rejected"],
  resolved: [],
  rejected: [],
};

export function allowedComplaintStatuses(
  status: string
): MarketplaceComplaintStatus[] {
  if (!(status in COMPLAINT_TRANSITIONS)) return [];
  return COMPLAINT_TRANSITIONS[status as MarketplaceComplaintStatus];
}

export function canTransitionComplaint(from: string, to: string) {
  return allowedComplaintStatuses(from).includes(
    to as MarketplaceComplaintStatus
  );
}

export function isTerminalComplaintStatus(status: string) {
  return status === "resolved" || status === "rejected";
}
