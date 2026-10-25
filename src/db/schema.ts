import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  numeric,
  integer,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const studyModeEnum = pgEnum("study_mode", ["regular", "weekend"]);
export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "admin"]);
export const permitStatusEnum = pgEnum("permit_status", [
  "active",
  "revoked",
  "expired",
]);
export const cardStatusEnum = pgEnum("card_status", ["pending", "active"]);
export const hallBookingStatusEnum = pgEnum("hall_booking_status", [
  "booked",
  "attended",
  "cancelled",
]);
export const participationStatusEnum = pgEnum("participation_status", [
  "registered",
  "confirmed",
  "declined",
]);
export const tournamentFormatEnum = pgEnum("tournament_format", [
  "single_elimination",
  "round_robin",
  "group_knockout",
]);
export const tournamentStatusEnum = pgEnum("tournament_status", [
  "draft",
  "active",
  "completed",
]);
export const matchStageEnum = pgEnum("match_stage", ["group", "knockout"]);
export const matchStatusEnum = pgEnum("match_status", ["pending", "completed"]);
export const marketplaceCategoryEnum = pgEnum("marketplace_category", [
  "products",
  "services",
  "both",
]);
export const marketplaceAvailabilityEnum = pgEnum("marketplace_availability", [
  "in_stock",
  "made_to_order",
  "service_on_demand",
]);
export const marketplaceApplicationStatusEnum = pgEnum(
  "marketplace_application_status",
  [
    "pending_review",
    "under_review",
    "additional_info_required",
    "approved",
    "rejected",
  ]
);
export const marketplaceStoreStatusEnum = pgEnum("marketplace_store_status", [
  "active",
  "inactive",
  "suspended",
  "closed",
]);
export const marketplaceListingStatusEnum = pgEnum("marketplace_listing_status", [
  "active",
  "pending_review",
  "removed",
]);
export const marketplaceProductAvailabilityEnum = pgEnum(
  "marketplace_product_availability",
  ["ready_stock", "preorder", "made_to_order"]
);
export const marketplaceServiceDeliveryEnum = pgEnum(
  "marketplace_service_delivery",
  ["physical", "virtual", "on_campus"]
);
export const marketplaceOrderStatusEnum = pgEnum("marketplace_order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "fulfilled",
  "cancelled",
]);
export const marketplacePaymentStatusEnum = pgEnum(
  "marketplace_payment_status",
  ["unpaid", "pending_confirmation", "paid", "refunded"]
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("admin"),
  permissions: text("permissions").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
  avatarUrl: text("avatar_url"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  indexNumber: text("index_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  passwordHash: text("password_hash"),
  email: text("email").unique(),
  phone: text("phone"),
  program: text("program"),
  level: text("level"),
  studyMode: studyModeEnum("study_mode"),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  avatarUrl: text("avatar_url"),
  hallId: uuid("hall_id").references(() => halls.id, { onDelete: "set null" }),
  createdByAdminId: uuid("created_by_admin_id").references(
    () => adminUsers.id
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const permits = pgTable("permits", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id),
  permitType: text("permit_type").notNull().default("Permit"),
  referenceNumber: text("reference_number").notNull().unique(),
  status: permitStatusEnum("status").notNull().default("active"),
  cardStatus: cardStatusEnum("card_status").notNull().default("pending"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status"),
  notes: text("notes"),
  issuedBy: uuid("issued_by")
    .notNull()
    .references(() => adminUsers.id),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const newsPosts = pgTable("news_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body"),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  linkUrl: text("link_url"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const executiveYearGroups = pgTable("executive_year_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull().unique(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const executiveProfiles = pgTable("executive_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  yearGroupId: uuid("year_group_id")
    .notNull()
    .references(() => executiveYearGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: text("position").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  socialLinks: jsonb("social_links"),
  adminUserId: uuid("admin_user_id").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const executiveAchievements = pgTable("executive_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  yearGroupId: uuid("year_group_id")
    .notNull()
    .references(() => executiveYearGroups.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => executiveProfiles.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  achievedAt: timestamp("achieved_at", { withTimezone: true }),
  imageUrl: text("image_url"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => adminUsers.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Halls
// ---------------------------------------------------------------------------

export const halls = pgTable("halls", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  wardenName: text("warden_name"),
  location: text("location"),
  contactEmail: text("contact_email"),
  capacity: integer("capacity"),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const hallEvents = pgTable("hall_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  hallId: uuid("hall_id").references(() => halls.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  capacity: integer("capacity"),
  bookingRequired: boolean("booking_required").notNull().default(true),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const hallEventBookings = pgTable(
  "hall_event_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => hallEvents.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: hallBookingStatusEnum("status").notNull().default("booked"),
    bookedAt: timestamp("booked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("hall_event_booking_unique").on(t.eventId, t.studentId)]
);

export const hallMessages = pgTable("hall_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  hallId: uuid("hall_id").references(() => halls.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  recipientCount: integer("recipient_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  sentBy: uuid("sent_by")
    .notNull()
    .references(() => adminUsers.id),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

export const marketplaceApplications = pgTable("marketplace_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  contactNumber: text("contact_number").notNull(),
  storeName: text("store_name").notNull(),
  category: marketplaceCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  offerings: text("offerings").notNull(),
  availability: marketplaceAvailabilityEnum("availability").notNull(),
  fulfilmentMethods: jsonb("fulfilment_methods")
    .$type<string[]>()
    .notNull()
    .default([]),
  evidenceUrl: text("evidence_url"),
  evidenceNotes: text("evidence_notes"),
  declarationAccepted: boolean("declaration_accepted").notNull().default(false),
  status: marketplaceApplicationStatusEnum("status")
    .notNull()
    .default("pending_review"),
  decisionReason: text("decision_reason"),
  adminNotes: text("admin_notes"),
  reviewedBy: uuid("reviewed_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const marketplaceApplicationEvents = pgTable(
  "marketplace_application_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => marketplaceApplications.id, { onDelete: "cascade" }),
    actorType: text("actor_type").notNull(),
    actorId: uuid("actor_id"),
    actorName: text("actor_name").notNull(),
    status: marketplaceApplicationStatusEnum("status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

export const marketplaceStores = pgTable("marketplace_stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: marketplaceCategoryEnum("category").notNull(),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  fulfilmentMethods: jsonb("fulfilment_methods")
    .$type<string[]>()
    .notNull()
    .default([]),
  operatingHours: text("operating_hours"),
  pickupLocation: text("pickup_location"),
  status: marketplaceStoreStatusEnum("status").notNull().default("active"),
  statusReason: text("status_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const marketplaceProducts = pgTable("marketplace_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => marketplaceStores.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric("discount_price", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  availability: marketplaceProductAvailabilityEnum("availability")
    .notNull()
    .default("ready_stock"),
  fulfilmentMethods: jsonb("fulfilment_methods")
    .$type<string[]>()
    .notNull()
    .default([]),
  published: boolean("published").notNull().default(true),
  moderationStatus: marketplaceListingStatusEnum("moderation_status")
    .notNull()
    .default("active"),
  moderationReason: text("moderation_reason"),
  moderatedBy: uuid("moderated_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const marketplaceServices = pgTable("marketplace_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => marketplaceStores.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  pricingUnit: text("pricing_unit"),
  durationMinutes: integer("duration_minutes"),
  availability: text("availability"),
  bookingRequired: boolean("booking_required").notNull().default(true),
  deliveryMethod: marketplaceServiceDeliveryEnum("delivery_method")
    .notNull()
    .default("on_campus"),
  published: boolean("published").notNull().default(true),
  moderationStatus: marketplaceListingStatusEnum("moderation_status")
    .notNull()
    .default("active"),
  moderationReason: text("moderation_reason"),
  moderatedBy: uuid("moderated_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const marketplaceOrders = pgTable(
  "marketplace_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    checkoutGroupId: uuid("checkout_group_id").notNull(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => marketplaceStores.id, { onDelete: "restrict" }),
    buyerStudentId: uuid("buyer_student_id")
      .notNull()
      .references(() => students.id, { onDelete: "restrict" }),
    buyerName: text("buyer_name").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    buyerEmail: text("buyer_email"),
    fulfilmentMethod: text("fulfilment_method").notNull(),
    deliveryAddress: text("delivery_address"),
    buyerNote: text("buyer_note"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    status: marketplaceOrderStatusEnum("status")
      .notNull()
      .default("pending"),
    paymentStatus: marketplacePaymentStatusEnum("payment_status")
      .notNull()
      .default("unpaid"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("marketplace_orders_buyer_idx").on(table.buyerStudentId),
    index("marketplace_orders_store_idx").on(table.storeId),
    index("marketplace_orders_group_idx").on(table.checkoutGroupId),
  ]
);

export const marketplaceOrderItems = pgTable(
  "marketplace_order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => marketplaceOrders.id, { onDelete: "cascade" }),
    listingType: text("listing_type").notNull(),
    listingId: uuid("listing_id").notNull(),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("marketplace_order_items_order_idx").on(table.orderId)]
);

// ---------------------------------------------------------------------------
// Sports
// ---------------------------------------------------------------------------

export const sportEvents = pgTable("sport_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  sport: text("sport").notNull(),
  description: text("description"),
  venue: text("venue"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sportParticipations = pgTable(
  "sport_participations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => sportEvents.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: participationStatusEnum("status").notNull().default("registered"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("sport_participation_unique").on(t.eventId, t.studentId)]
);

export const sportTournaments = pgTable("sport_tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sport: text("sport"),
  description: text("description"),
  format: tournamentFormatEnum("format").notNull().default("single_elimination"),
  status: tournamentStatusEnum("status").notNull().default("draft"),
  eventId: uuid("event_id").references(() => sportEvents.id, {
    onDelete: "set null",
  }),
  numberOfGroups: integer("number_of_groups"),
  qualifiersPerGroup: integer("qualifiers_per_group"),
  bracketRounds: integer("bracket_rounds"),
  championName: text("champion_name"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tournamentParticipants = pgTable(
  "tournament_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => sportTournaments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    seed: integer("seed").notNull().default(0),
    groupLabel: text("group_label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("tournament_participant_unique").on(t.tournamentId, t.studentId)]
);

export const sportMatches = pgTable("sport_matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => sportTournaments.id, { onDelete: "cascade" }),
  stage: matchStageEnum("stage").notNull().default("knockout"),
  groupLabel: text("group_label"),
  round: integer("round").notNull().default(1),
  matchIndex: integer("match_index").notNull().default(0),
  participantAId: uuid("participant_a_id").references(
    () => tournamentParticipants.id,
    { onDelete: "set null" }
  ),
  participantBId: uuid("participant_b_id").references(
    () => tournamentParticipants.id,
    { onDelete: "set null" }
  ),
  scoreA: integer("score_a"),
  scoreB: integer("score_b"),
  winnerId: uuid("winner_id").references(() => tournamentParticipants.id, {
    onDelete: "set null",
  }),
  status: matchStatusEnum("status").notNull().default("pending"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  venue: text("venue"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sportAnnouncements = pgTable("sport_announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  eventId: uuid("event_id").references(() => sportEvents.id, {
    onDelete: "set null",
  }),
  recipientCount: integer("recipient_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminUsers.id),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  studentsCreated: many(students),
  permitsIssued: many(permits),
  auditLogs: many(auditLogs),
  eventsCreated: many(events),
  newsPostsCreated: many(newsPosts),
  executiveProfiles: many(executiveProfiles),
}));

export const executiveYearGroupsRelations = relations(
  executiveYearGroups,
  ({ many }) => ({
    profiles: many(executiveProfiles),
    achievements: many(executiveAchievements),
  })
);

export const executiveProfilesRelations = relations(
  executiveProfiles,
  ({ one, many }) => ({
    yearGroup: one(executiveYearGroups, {
      fields: [executiveProfiles.yearGroupId],
      references: [executiveYearGroups.id],
    }),
    adminUser: one(adminUsers, {
      fields: [executiveProfiles.adminUserId],
      references: [adminUsers.id],
    }),
    achievements: many(executiveAchievements),
  })
);

export const executiveAchievementsRelations = relations(
  executiveAchievements,
  ({ one }) => ({
    yearGroup: one(executiveYearGroups, {
      fields: [executiveAchievements.yearGroupId],
      references: [executiveYearGroups.id],
    }),
    profile: one(executiveProfiles, {
      fields: [executiveAchievements.profileId],
      references: [executiveProfiles.id],
    }),
  })
);

export const eventsRelations = relations(events, ({ one }) => ({
  creator: one(adminUsers, {
    fields: [events.createdBy],
    references: [adminUsers.id],
  }),
}));

export const newsPostsRelations = relations(newsPosts, ({ one }) => ({
  creator: one(adminUsers, {
    fields: [newsPosts.createdBy],
    references: [adminUsers.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  createdByAdmin: one(adminUsers, {
    fields: [students.createdByAdminId],
    references: [adminUsers.id],
  }),
  hall: one(halls, {
    fields: [students.hallId],
    references: [halls.id],
  }),
  permits: many(permits),
}));

export const hallsRelations = relations(halls, ({ one, many }) => ({
  createdBy: one(adminUsers, {
    fields: [halls.createdBy],
    references: [adminUsers.id],
  }),
  students: many(students),
  events: many(hallEvents),
  messages: many(hallMessages),
}));

export const hallEventsRelations = relations(hallEvents, ({ one, many }) => ({
  hall: one(halls, {
    fields: [hallEvents.hallId],
    references: [halls.id],
  }),
  creator: one(adminUsers, {
    fields: [hallEvents.createdBy],
    references: [adminUsers.id],
  }),
  bookings: many(hallEventBookings),
}));

export const hallEventBookingsRelations = relations(
  hallEventBookings,
  ({ one }) => ({
    event: one(hallEvents, {
      fields: [hallEventBookings.eventId],
      references: [hallEvents.id],
    }),
    student: one(students, {
      fields: [hallEventBookings.studentId],
      references: [students.id],
    }),
  })
);

export const hallMessagesRelations = relations(hallMessages, ({ one }) => ({
  hall: one(halls, {
    fields: [hallMessages.hallId],
    references: [halls.id],
  }),
  sender: one(adminUsers, {
    fields: [hallMessages.sentBy],
    references: [adminUsers.id],
  }),
}));

export const sportEventsRelations = relations(sportEvents, ({ one, many }) => ({
  creator: one(adminUsers, {
    fields: [sportEvents.createdBy],
    references: [adminUsers.id],
  }),
  participations: many(sportParticipations),
  tournaments: many(sportTournaments),
}));

export const sportParticipationsRelations = relations(
  sportParticipations,
  ({ one }) => ({
    event: one(sportEvents, {
      fields: [sportParticipations.eventId],
      references: [sportEvents.id],
    }),
    student: one(students, {
      fields: [sportParticipations.studentId],
      references: [students.id],
    }),
  })
);

export const sportTournamentsRelations = relations(
  sportTournaments,
  ({ one, many }) => ({
    creator: one(adminUsers, {
      fields: [sportTournaments.createdBy],
      references: [adminUsers.id],
    }),
    event: one(sportEvents, {
      fields: [sportTournaments.eventId],
      references: [sportEvents.id],
    }),
    participants: many(tournamentParticipants),
    matches: many(sportMatches),
  })
);

export const tournamentParticipantsRelations = relations(
  tournamentParticipants,
  ({ one }) => ({
    tournament: one(sportTournaments, {
      fields: [tournamentParticipants.tournamentId],
      references: [sportTournaments.id],
    }),
    student: one(students, {
      fields: [tournamentParticipants.studentId],
      references: [students.id],
    }),
  })
);

export const sportMatchesRelations = relations(sportMatches, ({ one }) => ({
  tournament: one(sportTournaments, {
    fields: [sportMatches.tournamentId],
    references: [sportTournaments.id],
  }),
  participantA: one(tournamentParticipants, {
    fields: [sportMatches.participantAId],
    references: [tournamentParticipants.id],
    relationName: "match_participant_a",
  }),
  participantB: one(tournamentParticipants, {
    fields: [sportMatches.participantBId],
    references: [tournamentParticipants.id],
    relationName: "match_participant_b",
  }),
  winner: one(tournamentParticipants, {
    fields: [sportMatches.winnerId],
    references: [tournamentParticipants.id],
    relationName: "match_winner",
  }),
}));

export const sportAnnouncementsRelations = relations(
  sportAnnouncements,
  ({ one }) => ({
    creator: one(adminUsers, {
      fields: [sportAnnouncements.createdBy],
      references: [adminUsers.id],
    }),
    event: one(sportEvents, {
      fields: [sportAnnouncements.eventId],
      references: [sportEvents.id],
    }),
  })
);

export const permitsRelations = relations(permits, ({ one }) => ({
  student: one(students, {
    fields: [permits.studentId],
    references: [students.id],
  }),
  issuer: one(adminUsers, {
    fields: [permits.issuedBy],
    references: [adminUsers.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(adminUsers, {
    fields: [auditLogs.actorId],
    references: [adminUsers.id],
  }),
}));

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Permit = typeof permits.$inferSelect;
export type NewPermit = typeof permits.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type NewsPost = typeof newsPosts.$inferSelect;
export type NewNewsPost = typeof newsPosts.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type ExecutiveYearGroup = typeof executiveYearGroups.$inferSelect;
export type NewExecutiveYearGroup = typeof executiveYearGroups.$inferInsert;
export type ExecutiveProfile = typeof executiveProfiles.$inferSelect;
export type NewExecutiveProfile = typeof executiveProfiles.$inferInsert;
export type ExecutiveAchievement = typeof executiveAchievements.$inferSelect;
export type NewExecutiveAchievement = typeof executiveAchievements.$inferInsert;
export type Hall = typeof halls.$inferSelect;
export type NewHall = typeof halls.$inferInsert;
export type HallEvent = typeof hallEvents.$inferSelect;
export type NewHallEvent = typeof hallEvents.$inferInsert;
export type HallEventBooking = typeof hallEventBookings.$inferSelect;
export type NewHallEventBooking = typeof hallEventBookings.$inferInsert;
export type HallMessage = typeof hallMessages.$inferSelect;
export type NewHallMessage = typeof hallMessages.$inferInsert;
export type MarketplaceApplication = typeof marketplaceApplications.$inferSelect;
export type NewMarketplaceApplication = typeof marketplaceApplications.$inferInsert;
export type MarketplaceApplicationEvent =
  typeof marketplaceApplicationEvents.$inferSelect;
export type NewMarketplaceApplicationEvent =
  typeof marketplaceApplicationEvents.$inferInsert;
export type MarketplaceStore = typeof marketplaceStores.$inferSelect;
export type NewMarketplaceStore = typeof marketplaceStores.$inferInsert;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type NewMarketplaceProduct = typeof marketplaceProducts.$inferInsert;
export type MarketplaceService = typeof marketplaceServices.$inferSelect;
export type NewMarketplaceService = typeof marketplaceServices.$inferInsert;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type NewMarketplaceOrder = typeof marketplaceOrders.$inferInsert;
export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type NewMarketplaceOrderItem = typeof marketplaceOrderItems.$inferInsert;
export type SportEvent = typeof sportEvents.$inferSelect;
export type NewSportEvent = typeof sportEvents.$inferInsert;
export type SportParticipation = typeof sportParticipations.$inferSelect;
export type NewSportParticipation = typeof sportParticipations.$inferInsert;
export type SportTournament = typeof sportTournaments.$inferSelect;
export type NewSportTournament = typeof sportTournaments.$inferInsert;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type NewTournamentParticipant = typeof tournamentParticipants.$inferInsert;
export type SportMatch = typeof sportMatches.$inferSelect;
export type NewSportMatch = typeof sportMatches.$inferInsert;
export type SportAnnouncement = typeof sportAnnouncements.$inferSelect;
export type NewSportAnnouncement = typeof sportAnnouncements.$inferInsert;
