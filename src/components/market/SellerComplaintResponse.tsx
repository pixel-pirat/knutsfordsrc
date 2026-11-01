"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function SellerComplaintResponse({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (status === "resolved" || status === "rejected") {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/marketplace/seller/complaints/${encodeURIComponent(reference)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: note.trim() }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not submit your response.");
        return;
      }
      setSaved(true);
      setNote("");
      router.refresh();
    } catch {
      setError("Could not submit your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Respond to this complaint. The SRC admin reviewing it will see your response."
      />
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          Response submitted.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={submitting || !note.trim()}>
        {submitting ? "Submitting…" : "Submit response"}
      </Button>
    </form>
  );
}
