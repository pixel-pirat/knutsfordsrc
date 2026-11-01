"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMPLAINT_STATUS_LABELS } from "@/lib/marketplace";
import { allowedComplaintStatuses } from "@/lib/complaintWorkflow";

export function ComplaintActionsPanel({
  reference,
  status,
  assignedAdminId,
  currentAdminId,
}: {
  reference: string;
  status: string;
  assignedAdminId: string | null;
  currentAdminId: string;
}) {
  const router = useRouter();
  const nextStatuses = allowedComplaintStatuses(status);
  const [nextStatus, setNextStatus] = useState<string>(nextStatuses[0] ?? "");
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState<
    "status" | "assign" | "note" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const isAssignedToMe = assignedAdminId === currentAdminId;
  const requiresNote = nextStatus === "resolved" || nextStatus === "rejected";

  async function submit(
    kind: "status" | "assign" | "note",
    body: Record<string, unknown>
  ) {
    setError(null);
    setSaved(null);
    setSubmitting(kind);

    try {
      const response = await fetch(
        `/api/admin/marketplace/complaints/${encodeURIComponent(reference)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not update this complaint.");
        return;
      }
      setSaved(
        kind === "status"
          ? "Status updated."
          : kind === "assign"
            ? "Assignment updated."
            : "Note added."
      );
      setStatusNote("");
      setNote("");
      router.refresh();
    } catch {
      setError("Could not update this complaint. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  function handleStatus(event: React.FormEvent) {
    event.preventDefault();
    if (!nextStatus) return;
    if (requiresNote && statusNote.trim().length === 0) {
      setError(
        `Please add a ${nextStatus === "resolved" ? "resolution" : "rejection"} note.`
      );
      return;
    }
    void submit("status", { action: "status", status: nextStatus, note: statusNote.trim() });
  }

  function handleNote(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    void submit("note", { action: "note", note: note.trim() });
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
        Manage complaint
      </h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        {reference}
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          {saved}
        </p>
      )}

      <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Assignment
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full"
          disabled={submitting !== null}
          onClick={() =>
            void submit("assign", { action: "assign", assign: !isAssignedToMe })
          }
        >
          {submitting === "assign"
            ? "Updating…"
            : isAssignedToMe
              ? "Unassign from me"
              : "Assign to me"}
        </Button>
      </div>

      {nextStatuses.length > 0 ? (
        <form onSubmit={handleStatus} className="mt-5 space-y-3 border-t border-black/5 pt-5 dark:border-white/10">
          <div>
            <Label htmlFor={`complaint-status-${reference}`}>Status</Label>
            <select
              id={`complaint-status-${reference}`}
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
              className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {nextStatuses.map((value) => (
                <option key={value} value={value}>
                  {COMPLAINT_STATUS_LABELS[value] ?? value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor={`complaint-status-note-${reference}`}>
              {requiresNote
                ? nextStatus === "resolved"
                  ? "Resolution notes"
                  : "Rejection reason"
                : "Note (optional)"}
            </Label>
            <Textarea
              id={`complaint-status-note-${reference}`}
              className="mt-1.5"
              rows={3}
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              maxLength={1000}
              placeholder={
                requiresNote
                  ? "Explain the outcome for the record"
                  : "Add context for this status change"
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting !== null}>
            {submitting === "status" ? "Updating…" : "Update status"}
          </Button>
        </form>
      ) : (
        <p className="mt-5 border-t border-black/5 pt-5 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
          This complaint is closed. No further status changes are available.
        </p>
      )}

      <form onSubmit={handleNote} className="mt-5 space-y-3 border-t border-black/5 pt-5 dark:border-white/10">
        <div>
          <Label htmlFor={`complaint-note-${reference}`}>Add an internal note</Label>
          <Textarea
            id={`complaint-note-${reference}`}
            className="mt-1.5"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            placeholder="Log a comment on this complaint"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={submitting !== null || !note.trim()}
        >
          {submitting === "note" ? "Saving…" : "Add note"}
        </Button>
      </form>
    </section>
  );
}
