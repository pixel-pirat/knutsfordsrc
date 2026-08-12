import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const studyModeEnum = pgEnum("study_mode", ["regular", "weekend"]);

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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
