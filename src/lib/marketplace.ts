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

export const MODERATION_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending_review: "Needs review",
  removed: "Removed",
};

export const MODERATION_STATUS_STYLES: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  pending_review: "border-orange-200 bg-orange-50 text-orange-700",
  removed: "border-red-200 bg-red-50 text-red-700",
};

export const PRODUCT_AVAILABILITY_LABELS: Record<string, string> = {
  ready_stock: "Ready stock",
  preorder: "Pre-order",
  made_to_order: "Made to order",
};

export const SERVICE_DELIVERY_LABELS: Record<string, string> = {
  physical: "Physical",
  virtual: "Virtual",
  on_campus: "On campus",
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  product: "Product",
  service: "Service",
};

export const MAX_LISTING_QUANTITY = 20;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending seller confirmation",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  preparing: "border-indigo-200 bg-indigo-50 text-indigo-700",
  ready: "border-purple-200 bg-purple-50 text-purple-700",
  fulfilled: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Payment pending",
  pending_confirmation: "Awaiting payment confirmation",
  paid: "Paid",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unpaid: "border-amber-200 bg-amber-50 text-amber-700",
  pending_confirmation: "border-blue-200 bg-blue-50 text-blue-700",
  paid: "border-green-200 bg-green-50 text-green-700",
  refunded: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

export type MarketplaceListingType = "product" | "service";

export type PublicStoreInfo = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string;
  contactEmail: string | null;
  contactPhone: string | null;
  fulfilmentMethods: string[];
  operatingHours: string | null;
  pickupLocation: string | null;
  sellerFirstName: string;
  sellerProgram: string | null;
  sellerLevel: string | null;
};

export type PublicStore = PublicStoreInfo & {
  listingCount: number;
  productCount: number;
  serviceCount: number;
};

export type PublicListing = {
  key: string;
  id: string;
  type: MarketplaceListingType;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  priceUnit: string | null;
  durationMinutes: number | null;
  stockQuantity: number | null;
  availability: string;
  inStock: boolean;
  bookingRequired: boolean;
  deliveryMethod: "physical" | "virtual" | "on_campus" | null;
  fulfilmentMethods: string[];
  createdAt: string;
  store: PublicStoreInfo;
};

export type BuyerOrderItem = {
  id: string;
  listingType: string;
  listingId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type BuyerOrderSummary = {
  id: string;
  orderNumber: string;
  checkoutGroupId: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  subtotal: number;
  status: string;
  paymentStatus: string;
  fulfilmentMethod: string;
  createdAt: string;
  itemCount: number;
};

export type BuyerOrderDetail = BuyerOrderSummary & {
  storePickupLocation: string | null;
  storeContactEmail: string | null;
  storeContactPhone: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  deliveryAddress: string | null;
  buyerNote: string | null;
  items: BuyerOrderItem[];
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
