import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSecretKey } from "./crypto";

const ADMIN_SESSION_COOKIE = "kn_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminSessionPayload = {
  adminId: string;
};

export async function createAdminSession(payload: AdminSessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.adminId !== "string") return null;
    return { adminId: payload.adminId };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export { ADMIN_SESSION_COOKIE };
