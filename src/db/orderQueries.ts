import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import {
  marketplaceOrderItems,
  marketplaceOrders,
  marketplaceProducts,
  marketplaceServices,
  marketplaceStores,
  type NewMarketplaceOrder,
  type NewMarketplaceOrderItem,
} from "./schema";
import type {
  BuyerOrderDetail,
  BuyerOrderItem,
  BuyerOrderSummary,
  MarketplaceListingType,
} from "@/lib/marketplace";

export type CheckoutItemInput = {
  type: MarketplaceListingType;
  id: string;
  quantity: number;
};

export type CheckoutStoreInput = {
  storeId: string;
  fulfilmentMethod: string;
  deliveryAddress?: string | null;
  note?: string | null;
};

export type CreateCheckoutInput = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  phone: string;
  email?: string | null;
  items: CheckoutItemInput[];
  stores: CheckoutStoreInput[];
};

export type CreatedCheckout = {
  checkoutGroupId: string;
  total: number;
  orders: {
    id: string;
    orderNumber: string;
    storeId: string;
    storeName: string;
    subtotal: number;
  }[];
};

export class MarketplaceCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketplaceCheckoutError";
  }
}

type CheckoutListing = {
  key: string;
  type: MarketplaceListingType;
  id: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeFulfilmentMethods: string[];
  storePickupLocation: string | null;
  itemFulfilmentMethods: string[];
  availability: string | null;
  stockQuantity: number | null;
};

function priceCents(price: string, discountPrice?: string | null) {
  const regular = Math.round(Number(price) * 100);
  if (!discountPrice) return regular;
  const discounted = Math.round(Number(discountPrice) * 100);
  return discounted < regular ? discounted : regular;
}

function orderNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `MKT-${date}-${suffix}`;
}

async function loadCheckoutListings(items: CheckoutItemInput[]) {
  const productIds = items
    .filter((item) => item.type === "product")
    .map((item) => item.id);
  const serviceIds = items
    .filter((item) => item.type === "service")
    .map((item) => item.id);

  const [productRows, serviceRows] = await Promise.all([
    productIds.length > 0
      ? db
          .select({
            id: marketplaceProducts.id,
            name: marketplaceProducts.name,
            imageUrl: marketplaceProducts.imageUrl,
            price: marketplaceProducts.price,
            discountPrice: marketplaceProducts.discountPrice,
            stockQuantity: marketplaceProducts.stockQuantity,
            availability: marketplaceProducts.availability,
            itemFulfilmentMethods: marketplaceProducts.fulfilmentMethods,
            storeId: marketplaceStores.id,
            storeName: marketplaceStores.name,
            storeSlug: marketplaceStores.slug,
            storeFulfilmentMethods: marketplaceStores.fulfilmentMethods,
            storePickupLocation: marketplaceStores.pickupLocation,
          })
          .from(marketplaceProducts)
          .innerJoin(
            marketplaceStores,
            eq(marketplaceProducts.storeId, marketplaceStores.id)
          )
          .where(
            and(
              inArray(marketplaceProducts.id, productIds),
              eq(marketplaceProducts.published, true),
              eq(marketplaceProducts.moderationStatus, "active"),
              eq(marketplaceStores.status, "active")
            )
          )
      : Promise.resolve([]),
    serviceIds.length > 0
      ? db
          .select({
            id: marketplaceServices.id,
            name: marketplaceServices.name,
            imageUrl: marketplaceServices.imageUrl,
            price: marketplaceServices.price,
            availability: marketplaceServices.availability,
            storeId: marketplaceStores.id,
            storeName: marketplaceStores.name,
            storeSlug: marketplaceStores.slug,
            storeFulfilmentMethods: marketplaceStores.fulfilmentMethods,
            storePickupLocation: marketplaceStores.pickupLocation,
          })
          .from(marketplaceServices)
          .innerJoin(
            marketplaceStores,
            eq(marketplaceServices.storeId, marketplaceStores.id)
          )
          .where(
            and(
              inArray(marketplaceServices.id, serviceIds),
              eq(marketplaceServices.published, true),
              eq(marketplaceServices.moderationStatus, "active"),
              eq(marketplaceStores.status, "active")
            )
          )
      : Promise.resolve([]),
  ]);

  const listings = new Map<string, CheckoutListing>();

  for (const row of productRows) {
    listings.set(`product:${row.id}`, {
      key: `product:${row.id}`,
      type: "product",
      id: row.id,
      name: row.name,
      imageUrl: row.imageUrl,
      priceCents: priceCents(row.price, row.discountPrice),
      storeId: row.storeId,
      storeName: row.storeName,
      storeSlug: row.storeSlug,
      storeFulfilmentMethods: row.storeFulfilmentMethods,
      storePickupLocation: row.storePickupLocation,
      itemFulfilmentMethods: row.itemFulfilmentMethods,
      availability: row.availability,
      stockQuantity: row.stockQuantity,
    });
  }

  for (const row of serviceRows) {
    listings.set(`service:${row.id}`, {
      key: `service:${row.id}`,
      type: "service",
      id: row.id,
      name: row.name,
      imageUrl: row.imageUrl,
      priceCents: priceCents(row.price),
      storeId: row.storeId,
      storeName: row.storeName,
      storeSlug: row.storeSlug,
      storeFulfilmentMethods: row.storeFulfilmentMethods,
      storePickupLocation: row.storePickupLocation,
      itemFulfilmentMethods: [],
      availability: row.availability,
      stockQuantity: null,
    });
  }

  return listings;
}

export async function createMarketplaceOrders(
  input: CreateCheckoutInput
): Promise<CreatedCheckout> {
  const mergedItems = new Map<
    string,
    { type: MarketplaceListingType; id: string; quantity: number }
  >();

  for (const item of input.items) {
    const key = `${item.type}:${item.id}`;
    const existing = mergedItems.get(key);
    const quantity = (existing?.quantity ?? 0) + item.quantity;
    if (quantity > 99) {
      throw new MarketplaceCheckoutError(
        "One of the items in your cart has too many units."
      );
    }
    mergedItems.set(key, { ...item, quantity });
  }

  const requestedItems = [...mergedItems.values()];
  const listings = await loadCheckoutListings(requestedItems);

  if (listings.size !== requestedItems.length) {
    throw new MarketplaceCheckoutError(
      "One or more items in your cart are no longer available. Please review your cart."
    );
  }

  const storeConfigs = new Map<string, CheckoutStoreInput>();
  for (const store of input.stores) {
    if (storeConfigs.has(store.storeId)) {
      throw new MarketplaceCheckoutError(
        "Only one fulfilment option can be chosen per store."
      );
    }
    storeConfigs.set(store.storeId, store);
  }

  type Group = {
    storeId: string;
    storeName: string;
    storeSlug: string;
    storePickupLocation: string | null;
    config: CheckoutStoreInput;
    items: { listing: CheckoutListing; quantity: number }[];
  };

  const groups = new Map<string, Group>();

  for (const item of requestedItems) {
    const listing = listings.get(`${item.type}:${item.id}`);
    if (!listing) {
      throw new MarketplaceCheckoutError(
        "One or more items in your cart are no longer available. Please review your cart."
      );
    }

    if (
      listing.availability === "ready_stock" &&
      listing.stockQuantity !== null &&
      listing.stockQuantity < item.quantity
    ) {
      throw new MarketplaceCheckoutError(
        `${listing.name} has only ${listing.stockQuantity} unit${
          listing.stockQuantity === 1 ? "" : "s"
        } left. Please update your cart.`
      );
    }

    const config = storeConfigs.get(listing.storeId);
    if (!config) {
      throw new MarketplaceCheckoutError(
        `Choose a fulfilment method for ${listing.storeName}.`
      );
    }

    if (!listing.storeFulfilmentMethods.includes(config.fulfilmentMethod)) {
      throw new MarketplaceCheckoutError(
        `${listing.storeName} does not offer that fulfilment method.`
      );
    }

    if (
      listing.itemFulfilmentMethods.length > 0 &&
      !listing.itemFulfilmentMethods.includes(config.fulfilmentMethod)
    ) {
      throw new MarketplaceCheckoutError(
        `${listing.name} does not offer the selected fulfilment method.`
      );
    }

    if (
      config.fulfilmentMethod === "delivery" &&
      !config.deliveryAddress?.trim()
    ) {
      throw new MarketplaceCheckoutError(
        `Enter a delivery address for ${listing.storeName}.`
      );
    }

    const group = groups.get(listing.storeId) ?? {
      storeId: listing.storeId,
      storeName: listing.storeName,
      storeSlug: listing.storeSlug,
      storePickupLocation: listing.storePickupLocation,
      config,
      items: [],
    };
    group.items.push({ listing, quantity: item.quantity });
    groups.set(listing.storeId, group);
  }

  for (const storeId of storeConfigs.keys()) {
    if (!groups.has(storeId)) {
      throw new MarketplaceCheckoutError(
        "One of the stores in your checkout is no longer in your cart."
      );
    }
  }

  const checkoutGroupId = randomUUID();
  const now = new Date();
  const orderRows: NewMarketplaceOrder[] = [];
  const itemRows: NewMarketplaceOrderItem[] = [];
  const createdOrders: CreatedCheckout["orders"] = [];
  const stockUpdates: { id: string; quantity: number }[] = [];
  let totalCents = 0;

  for (const group of groups.values()) {
    const orderId = randomUUID();
    const subtotalCents = group.items.reduce(
      (total, item) => total + item.listing.priceCents * item.quantity,
      0
    );
    totalCents += subtotalCents;

    orderRows.push({
      id: orderId,
      orderNumber: orderNumber(),
      checkoutGroupId,
      storeId: group.storeId,
      buyerStudentId: input.student.id,
      buyerName: `${input.student.firstName} ${input.student.lastName}`,
      buyerPhone: input.phone,
      buyerEmail: input.email?.trim() || null,
      fulfilmentMethod: group.config.fulfilmentMethod,
      deliveryAddress:
        group.config.fulfilmentMethod === "delivery"
          ? group.config.deliveryAddress?.trim() || null
          : null,
      buyerNote: group.config.note?.trim() || null,
      subtotal: (subtotalCents / 100).toFixed(2),
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: now,
      updatedAt: now,
    });

    for (const item of group.items) {
      const lineTotalCents = item.listing.priceCents * item.quantity;
      itemRows.push({
        orderId,
        listingType: item.listing.type,
        listingId: item.listing.id,
        name: item.listing.name,
        imageUrl: item.listing.imageUrl,
        unitPrice: (item.listing.priceCents / 100).toFixed(2),
        quantity: item.quantity,
        lineTotal: (lineTotalCents / 100).toFixed(2),
      });

      if (
        item.listing.type === "product" &&
        item.listing.availability === "ready_stock"
      ) {
        stockUpdates.push({ id: item.listing.id, quantity: item.quantity });
      }
    }

    createdOrders.push({
      id: orderId,
      orderNumber: orderRows[orderRows.length - 1].orderNumber,
      storeId: group.storeId,
      storeName: group.storeName,
      subtotal: Number((subtotalCents / 100).toFixed(2)),
    });
  }

  try {
    await db.insert(marketplaceOrders).values(orderRows);
    await db.insert(marketplaceOrderItems).values(itemRows);

    await Promise.all(
      stockUpdates.map((update) =>
        db
          .update(marketplaceProducts)
          .set({
            stockQuantity: sql`greatest(${marketplaceProducts.stockQuantity} - ${update.quantity}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(marketplaceProducts.id, update.id))
      )
    );
  } catch (error) {
    await db
      .delete(marketplaceOrders)
      .where(eq(marketplaceOrders.checkoutGroupId, checkoutGroupId))
      .catch(() => undefined);
    throw error;
  }

  return {
    checkoutGroupId,
    total: Number((totalCents / 100).toFixed(2)),
    orders: createdOrders,
  };
}

const orderColumns = {
  id: marketplaceOrders.id,
  orderNumber: marketplaceOrders.orderNumber,
  checkoutGroupId: marketplaceOrders.checkoutGroupId,
  storeId: marketplaceOrders.storeId,
  storeName: marketplaceStores.name,
  storeSlug: marketplaceStores.slug,
  storePickupLocation: marketplaceStores.pickupLocation,
  storeContactEmail: marketplaceStores.contactEmail,
  storeContactPhone: marketplaceStores.contactPhone,
  subtotal: marketplaceOrders.subtotal,
  status: marketplaceOrders.status,
  paymentStatus: marketplaceOrders.paymentStatus,
  fulfilmentMethod: marketplaceOrders.fulfilmentMethod,
  deliveryAddress: marketplaceOrders.deliveryAddress,
  buyerNote: marketplaceOrders.buyerNote,
  buyerName: marketplaceOrders.buyerName,
  buyerPhone: marketplaceOrders.buyerPhone,
  buyerEmail: marketplaceOrders.buyerEmail,
  createdAt: marketplaceOrders.createdAt,
};

type OrderRow = {
  id: string;
  orderNumber: string;
  checkoutGroupId: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storePickupLocation: string | null;
  storeContactEmail: string | null;
  storeContactPhone: string | null;
  subtotal: string;
  status: string;
  paymentStatus: string;
  fulfilmentMethod: string;
  deliveryAddress: string | null;
  buyerNote: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  createdAt: Date;
};

function mapOrderItem(
  row: typeof marketplaceOrderItems.$inferSelect
): BuyerOrderItem {
  return {
    id: row.id,
    listingType: row.listingType,
    listingId: row.listingId,
    name: row.name,
    imageUrl: row.imageUrl,
    unitPrice: Number(row.unitPrice),
    quantity: row.quantity,
    lineTotal: Number(row.lineTotal),
  };
}

async function withItems(rows: OrderRow[]): Promise<BuyerOrderDetail[]> {
  if (rows.length === 0) return [];

  const itemRows = await db
    .select()
    .from(marketplaceOrderItems)
    .where(
      inArray(
        marketplaceOrderItems.orderId,
        rows.map((row) => row.id)
      )
    )
    .orderBy(asc(marketplaceOrderItems.createdAt));

  const itemsByOrder = new Map<string, BuyerOrderItem[]>();
  for (const row of itemRows) {
    const items = itemsByOrder.get(row.orderId) ?? [];
    items.push(mapOrderItem(row));
    itemsByOrder.set(row.orderId, items);
  }

  return rows.map((row) => {
    const items = itemsByOrder.get(row.id) ?? [];
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      checkoutGroupId: row.checkoutGroupId,
      storeId: row.storeId,
      storeName: row.storeName,
      storeSlug: row.storeSlug,
      storePickupLocation: row.storePickupLocation,
      storeContactEmail: row.storeContactEmail,
      storeContactPhone: row.storeContactPhone,
      subtotal: Number(row.subtotal),
      status: row.status,
      paymentStatus: row.paymentStatus,
      fulfilmentMethod: row.fulfilmentMethod,
      deliveryAddress: row.deliveryAddress,
      buyerNote: row.buyerNote,
      buyerName: row.buyerName,
      buyerPhone: row.buyerPhone,
      buyerEmail: row.buyerEmail,
      createdAt: row.createdAt.toISOString(),
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      items,
    };
  });
}

export async function getBuyerOrders(
  studentId: string
): Promise<BuyerOrderSummary[]> {
  const rows = await db
    .select(orderColumns)
    .from(marketplaceOrders)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceOrders.storeId, marketplaceStores.id)
    )
    .where(eq(marketplaceOrders.buyerStudentId, studentId))
    .orderBy(desc(marketplaceOrders.createdAt));

  if (rows.length === 0) return [];

  const counts = await db
    .select({
      orderId: marketplaceOrderItems.orderId,
      count: sql<number>`sum(${marketplaceOrderItems.quantity})::int`,
    })
    .from(marketplaceOrderItems)
    .where(
      inArray(
        marketplaceOrderItems.orderId,
        rows.map((row) => row.id)
      )
    )
    .groupBy(marketplaceOrderItems.orderId);

  const countByOrder = new Map(counts.map((row) => [row.orderId, row.count]));

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    checkoutGroupId: row.checkoutGroupId,
    storeId: row.storeId,
    storeName: row.storeName,
    storeSlug: row.storeSlug,
    subtotal: Number(row.subtotal),
    status: row.status,
    paymentStatus: row.paymentStatus,
    fulfilmentMethod: row.fulfilmentMethod,
    createdAt: row.createdAt.toISOString(),
    itemCount: countByOrder.get(row.id) ?? 0,
  }));
}

export async function getBuyerOrderByNumber(
  studentId: string,
  number: string
): Promise<BuyerOrderDetail | null> {
  const [row] = await db
    .select(orderColumns)
    .from(marketplaceOrders)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceOrders.storeId, marketplaceStores.id)
    )
    .where(
      and(
        eq(marketplaceOrders.buyerStudentId, studentId),
        eq(marketplaceOrders.orderNumber, number)
      )
    );

  if (!row) return null;
  const [order] = await withItems([row]);
  return order ?? null;
}

export async function getBuyerOrdersByGroup(
  studentId: string,
  checkoutGroupId: string
): Promise<BuyerOrderDetail[]> {
  const rows = await db
    .select(orderColumns)
    .from(marketplaceOrders)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceOrders.storeId, marketplaceStores.id)
    )
    .where(
      and(
        eq(marketplaceOrders.buyerStudentId, studentId),
        eq(marketplaceOrders.checkoutGroupId, checkoutGroupId)
      )
    )
    .orderBy(asc(marketplaceOrders.createdAt));

  return withItems(rows);
}
