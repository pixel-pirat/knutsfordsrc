import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  numeric,
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
  passwordHash: text("password_hash").notNull(),
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
