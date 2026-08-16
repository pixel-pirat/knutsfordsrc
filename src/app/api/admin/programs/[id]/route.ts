import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { deleteProgram, logAudit } from "@/db/adminQueries";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can manage programmes" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const [deleted] = await deleteProgram(id);
  if (!deleted) {
    return NextResponse.json({ error: "Programme not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "program.delete",
    targetType: "program",
    targetId: id,
    metadata: { name: deleted.name },
  });

  return NextResponse.json({ success: true });
}
