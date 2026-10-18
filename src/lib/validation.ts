import { z } from "zod";

export const indexNumberSchema = z
  .string()
  .trim()
  .regex(
    /^261\d{5}$/,
    "Index number must start with 261 and be followed by 5 digits (e.g. 26103254)"
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signupSchema = z.object({
  indexNumber: indexNumberSchema,
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  indexNumber: indexNumberSchema,
  password: z.string().min(1, "Password is required"),
});

export const studyModeSchema = z.enum(["regular", "weekend"]);

export const profileSchema = z.object({
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  program: z.string().trim().min(1, "Programme is required"),
  level: z.enum(["100", "200", "300", "400"]),
  studyMode: studyModeSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminBootstrapSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: passwordSchema,
});

export const adminCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: passwordSchema,
  permissions: z.array(z.string()).default([]),
});

export const adminStudentCreateSchema = z.object({
  indexNumber: indexNumberSchema,
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  program: z.string().trim().max(120).optional().or(z.literal("")),
  level: z.enum(["100", "200", "300", "400"]).optional().or(z.literal("")),
  studyMode: studyModeSchema.optional().or(z.literal("")),
  avatarUrl: z.url().optional().or(z.literal("")),
});

export const adminStudentUpdateSchema = z.object({
  indexNumber: indexNumberSchema,
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  program: z.string().trim().max(120).optional().or(z.literal("")),
  level: z.enum(["100", "200", "300", "400"]).optional().or(z.literal("")),
  studyMode: studyModeSchema.optional().or(z.literal("")),
  avatarUrl: z.url().optional().or(z.literal("")),
});

export const paymentMethodSchema = z.enum(["Cash", "MoMo", "Bank Payment", "Free Card"]);

export const permitIssueSchema = z.object({
  studentId: z.uuid("Select a student first"),
  amount: z.coerce
    .number()
    .positive("Enter the amount paid")
    .max(1_000_000, "Enter a valid amount"),
  paymentMethod: paymentMethodSchema.optional().or(z.literal("")),
});

export const avatarUpdateSchema = z.object({
  avatarUrl: z.url("Invalid image URL"),
});

export const socialLinksSchema = z
  .record(z.string(), z.url().or(z.literal("")))
  .optional();

export const adminProfileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const programCreateSchema = z.object({
  name: z.string().trim().min(1, "Programme name is required").max(120),
});

export const permitExpiryDateSchema = z.object({
  date: z.iso.date("Select a valid expiry date"),
});

export const contactInfoSchema = z.object({
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  website: z.url("Enter a valid URL").optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
});

export const semesterConfigSchema = z.object({
  currentSemester: z.string().trim().min(1, "Semester is required").max(60),
  academicYear: z.string().trim().min(1, "Academic year is required").max(30),
  startDate: z.iso.date("Select a valid start date"),
  endDate: z.iso.date("Select a valid end date"),
});

export const permitConfigSchema = z.object({
  defaultAmount: z.coerce.number().min(0).max(1_000_000),
  currency: z.string().trim().min(1).max(10),
  enablePermitRequest: z.boolean(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  startsAt: z.string().trim().min(1, "Start date & time is required"),
  endsAt: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.url().optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export const newsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  body: z.string().trim().max(20000).optional().or(z.literal("")),
  imageUrl: z.url().optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export const yearGroupSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export const executiveProfileSchema = z.object({
  yearGroupId: z.uuid("Select a year group"),
  name: z.string().trim().min(1, "Name is required").max(120),
  position: z.string().trim().min(1, "Position is required").max(120),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.url().optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
  adminUserId: z.uuid().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const executiveAchievementSchema = z.object({
  yearGroupId: z.uuid("Select a year group"),
  profileId: z.uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  achievedAt: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.url().optional().or(z.literal("")),
});

// Self-service: a linked executive editing their own profile — no yearGroupId,
// name or position (those stay admin-controlled).
export const executiveSelfProfileSchema = z.object({
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.url().optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
});

// Self-service: a linked executive adding/editing their own achievement —
// yearGroupId and profileId are inferred server-side from their session.
export const executiveSelfAchievementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  achievedAt: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.url().optional().or(z.literal("")),
});
