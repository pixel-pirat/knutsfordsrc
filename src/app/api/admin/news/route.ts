import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { newsSchema } from "@/lib/validation";
import { listNewsForAdmin, createNewsPost, logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_news");
  if (error) return error;

  const news = await listNewsForAdmin();
  return NextResponse.json({ news });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [post] = await createNewsPost({
    title: parsed.data.title,
    excerpt: parsed.data.excerpt || null,
    body: parsed.data.body || null,
    imageUrl: parsed.data.imageUrl || null,
    published: parsed.data.published ?? true,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "news.create",
    targetType: "news_post",
    targetId: post.id,
    metadata: { title: post.title },
  });

  return NextResponse.json({ post });
}
