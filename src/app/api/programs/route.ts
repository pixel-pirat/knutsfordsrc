import { NextResponse } from "next/server";
import { listActivePrograms } from "@/db/adminQueries";

export async function GET() {
  const programs = await listActivePrograms();
  return NextResponse.json({
    programs: programs.map((p) => ({ id: p.id, name: p.name })),
  });
}
