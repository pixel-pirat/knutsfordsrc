import {
  MAX_LISTING_QUANTITY,
  type PublicListing,
} from "@/lib/marketplace";
import type { CartItemInput } from "@/lib/marketCart";

export function listingMaxQuantity(listing: PublicListing) {
  if (!listing.inStock) return 0;
  if (
    listing.type === "product" &&
    listing.availability === "ready_stock"
  ) {
    return listing.stockQuantity ?? 0;
  }
  return MAX_LISTING_QUANTITY;
}

export function toCartItem(listing: PublicListing): CartItemInput {
  return {
    type: listing.type,
    id: listing.id,
    name: listing.name,
    price: listing.price,
    imageUrl: listing.imageUrl,
    maxQuantity: listingMaxQuantity(listing),
    storeId: listing.store.id,
    storeName: listing.store.name,
    storeSlug: listing.store.slug,
    storeFulfilmentMethods: listing.store.fulfilmentMethods,
    storePickupLocation: listing.store.pickupLocation,
  };
}
