import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { listHallOptions } from "@/db/hallQueries";

/** Simple id/name list for hall dropdowns (any authenticated admin). */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const halls = await listHallOptions();
  return NextResponse.json({ halls });
}
