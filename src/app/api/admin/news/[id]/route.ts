import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { newsSchema } from "@/lib/validation";
import { getNewsPostById, updateNewsPost, deleteNewsPost, logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_news");
  if (error) return error;

  const { id } = await params;
  const post = await getNewsPostById(id);
  if (!post) {
    return NextResponse.json({ error: "News post not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [post] = await updateNewsPost(id, {
    title: parsed.data.title,
    excerpt: parsed.data.excerpt || null,
    body: parsed.data.body || null,
    imageUrl: parsed.data.imageUrl || null,
    published: parsed.data.published ?? true,
  });

  if (!post) {
    return NextResponse.json({ error: "News post not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "news.update",
    targetType: "news_post",
    targetId: post.id,
    metadata: { title: post.title },
  });

  return NextResponse.json({ post });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteNewsPost(id);
  if (!deleted) {
    return NextResponse.json({ error: "News post not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "news.delete",
    targetType: "news_post",
    targetId: id,
    metadata: { title: deleted.title },
  });

  return NextResponse.json({ success: true });
}
