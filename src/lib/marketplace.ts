export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  under_review: "Under Review",
  additional_info_required: "Info Required",
  approved: "Approved",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_STYLES: Record<string, string> = {
  pending_review: "border-amber-200 bg-amber-50 text-amber-700",
  under_review: "border-blue-200 bg-blue-50 text-blue-700",
  additional_info_required: "border-orange-200 bg-orange-50 text-orange-700",
  approved: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

export const STORE_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  closed: "Closed",
};

export const STORE_STATUS_STYLES: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  inactive: "border-neutral-200 bg-neutral-100 text-neutral-500",
  suspended: "border-red-200 bg-red-50 text-red-700",
  closed: "border-neutral-200 bg-neutral-100 text-neutral-500",
};

export const CATEGORY_LABELS: Record<string, string> = {
  products: "Products",
  services: "Services",
  both: "Products & Services",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  in_stock: "In stock",
  made_to_order: "Made to order",
  service_on_demand: "Service on demand",
};

export const FULFILMENT_LABELS: Record<string, string> = {
  campus_pickup: "Campus pickup",
  delivery: "Delivery",
  digital: "Digital",
  service_appointment: "Service appointment",
};

export function formatMarketplaceDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMarketplaceDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
