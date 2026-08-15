import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "kn_session";
const ADMIN_SESSION_COOKIE = "kn_admin_session";

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = await isValidSession(token);
  const adminAuthed = await isValidSession(adminToken);

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isAdminLoginRoute = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginRoute;

  if (isDashboardRoute && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !adminAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminLoginRoute && adminAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/admin/:path*"],
};
