import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { expenseSchema } from "@/lib/validation";
import { createExpense, logAudit } from "@/db/adminQueries";

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "You don't have permission to do this" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { description, amount, category, notes, incurredAt } = parsed.data;

  const [expense] = await createExpense({
    description,
    amount: amount.toFixed(2),
    category: category || null,
    notes: notes || null,
    ...(incurredAt ? { incurredAt } : {}),
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "expense.create",
    targetType: "expense",
    targetId: expense.id,
    metadata: { description, amount },
  });

  return NextResponse.json({ expense });
}
