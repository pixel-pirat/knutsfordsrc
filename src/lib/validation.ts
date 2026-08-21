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

export const adminProfileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const programCreateSchema = z.object({
  name: z.string().trim().min(1, "Programme name is required").max(120),
});

export const permitExpiryDaysSchema = z.object({
  days: z.coerce
    .number()
    .int("Enter a whole number of days")
    .positive("Enter a positive number of days")
    .max(3650, "Enter a value under 3650 days"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});
