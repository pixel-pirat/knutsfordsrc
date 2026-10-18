"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsDialog } from "./NewsDialog";

type NewsRow = {
  id: string;
  title: string;
  publishedAt: string;
  published: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NewsTable({ news }: { news: NewsRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(() => searchParams.get("new") === "1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openPost(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, title: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">News</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage the news shown on the student dashboard
          </p>
        </div>
        <Button onClick={() => openPost(null)}>New Post</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                  No posts yet.
                </TableCell>
              </TableRow>
            )}
            {news.map((post) => (
              <TableRow key={post.id} className="cursor-pointer" onClick={() => openPost(post.id)}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">{post.title}</TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {formatDate(post.publishedAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      post.published
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(post.id, post.title, e)}
                    disabled={deletingId === post.id}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                  >
                    {deletingId === post.id ? "Removing…" : "Remove"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NewsDialog
        postId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
