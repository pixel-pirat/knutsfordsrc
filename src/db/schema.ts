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
  permits: many(permits),
}));

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
export type ExecutiveYearGroup = typeof executiveYearGroups.$inferSelect;
export type NewExecutiveYearGroup = typeof executiveYearGroups.$inferInsert;
export type ExecutiveProfile = typeof executiveProfiles.$inferSelect;
export type NewExecutiveProfile = typeof executiveProfiles.$inferInsert;
export type ExecutiveAchievement = typeof executiveAchievements.$inferSelect;
export type NewExecutiveAchievement = typeof executiveAchievements.$inferInsert;
