import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/index";
import { loginAttempts } from "@/db/schema";

export type LoginScope = "student" | "admin";

const WINDOW_MINUTES = 15;
const IDENTIFIER_MAX_ATTEMPTS = 5;
const IP_MAX_ATTEMPTS = 20;

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

async function recentFailures(
  scope: LoginScope,
  column: "identifier" | "ip",
  value: string
) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      oldest: sql<string | null>`min(${loginAttempts.createdAt})::text`,
    })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.scope, scope),
        eq(loginAttempts[column], value),
        eq(loginAttempts.success, false),
        gte(loginAttempts.createdAt, windowStart)
      )
    );
  return row ?? { count: 0, oldest: null };
}

export async function checkLoginRateLimit(
  scope: LoginScope,
  identifier: string,
  ip: string
): Promise<RateLimitResult> {
  const [byIdentifier, byIp] = await Promise.all([
    recentFailures(scope, "identifier", identifier),
    recentFailures(scope, "ip", ip),
  ]);

  const expiries: number[] = [];
  if (byIdentifier.count >= IDENTIFIER_MAX_ATTEMPTS && byIdentifier.oldest) {
    expiries.push(new Date(byIdentifier.oldest).getTime() + WINDOW_MINUTES * 60_000);
  }
  if (byIp.count >= IP_MAX_ATTEMPTS && byIp.oldest) {
    expiries.push(new Date(byIp.oldest).getTime() + WINDOW_MINUTES * 60_000);
  }

  if (expiries.length === 0) return { limited: false };

  const retryAfterSeconds = Math.max(1, Math.ceil((Math.max(...expiries) - Date.now()) / 1000));
  return { limited: true, retryAfterSeconds };
}

export async function recordLoginAttempt(
  scope: LoginScope,
  identifier: string,
  ip: string,
  success: boolean
) {
  await db.insert(loginAttempts).values({ scope, identifier, ip, success });
  // Opportunistic cleanup so the table doesn't grow unbounded — no cron needed.
  if (Math.random() < 0.05) {
    db.delete(loginAttempts)
      .where(sql`${loginAttempts.createdAt} < now() - interval '1 day'`)
      .catch(() => {});
  }
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
