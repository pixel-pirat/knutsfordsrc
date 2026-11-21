import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { expenseSchema } from "@/lib/validation";
import { deleteExpense, getExpenseById, logAudit, updateExpense } from "@/db/adminQueries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "You don't have permission to do this" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { description, amount, category, notes, incurredAt } = parsed.data;

  const [updated] = await updateExpense(id, {
    description,
    amount: amount.toFixed(2),
    category: category || null,
    notes: notes || null,
    ...(incurredAt ? { incurredAt } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "expense.update",
    targetType: "expense",
    targetId: id,
    metadata: { description, amount },
  });

  return NextResponse.json({ expense: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "You don't have permission to do this" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getExpenseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  await deleteExpense(id);

  await logAudit({
    actorId: admin.id,
    action: "expense.delete",
    targetType: "expense",
    targetId: id,
    metadata: { description: existing.description, amount: existing.amount },
  });

  return NextResponse.json({ success: true });
}
