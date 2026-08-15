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

export const permitStudentSchema = z.object({
  indexNumber: indexNumberSchema,
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
});

export const permitIssueSchema = z.object({
  student: permitStudentSchema,
  permitType: z.string().trim().min(1, "Permit type is required"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
