"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Action = "start_review" | "request_info" | "approve" | "reject";

const ACTIONS: {
  value: Action;
  label: string;
  description: string;
  needsReason: boolean;
}[] = [
  {
    value: "start_review",
    label: "Mark Under Review",
    description: "Let the student know their application is being assessed",
    needsReason: false,
  },
  {
    value: "request_info",
    label: "Request Information",
    description: "Ask the student for more details before deciding",
    needsReason: true,
  },
  {
    value: "approve",
    label: "Approve",
    description: "Allow the student to create and operate their store",
    needsReason: false,
  },
  {
    value: "reject",
    label: "Reject",
    description: "Decline the application. The student can address the reason and resubmit",
    needsReason: true,
  },
];

export function ApplicationDecisionPanel({
  applicationId,
  status,
  existingReason,
}: {
  applicationId: string;
  status: string;
  existingReason: string | null;
}) {
  const router = useRouter();
  const [action, setAction] = useState<Action>(
    status === "pending_review" ? "start_review" : "approve"
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selected = ACTIONS.find((a) => a.value === action) ?? ACTIONS[0];

  async function handleSubmit() {
    setError(null);
    if (selected.needsReason && reason.trim().length === 0) {
      setError("Please provide a reason the student will see.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/marketplace/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            reason: reason.trim(),
            adminNotes: "",
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setReason("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "approved") {
    return (
      <section className="rounded-2xl bg-green-50 p-5 ring-1 ring-green-200 dark:bg-green-950/30 dark:ring-green-900">
        <h2 className="text-sm font-bold text-green-800 dark:text-green-300">
          Application approved
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          The student can now set up their store from their dashboard.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
        Decision
      </h2>

      {status === "rejected" && existingReason && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
          Previously rejected: {existingReason}
        </p>
      )}
      {status === "additional_info_required" && existingReason && (
        <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2.5 text-xs text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          Information requested: {existingReason}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {ACTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
              action === option.value
                ? "border-gold bg-gold/10"
                : "border-black/10 hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.03]"
            }`}
          >
            <input
              type="radio"
              name="decision-action"
              className="mt-1"
              checked={action === option.value}
              onChange={() => setAction(option.value)}
            />
            <span>
              <span className="block text-sm font-semibold text-ink dark:text-neutral-100">
                {option.label}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <Label htmlFor="decision-reason">
          {selected.needsReason ? "Reason (shown to student)" : "Note (optional)"}
        </Label>
        <Textarea
          id="decision-reason"
          className="mt-1.5"
          rows={3}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            selected.needsReason
              ? "Explain what the student needs to do or why the application was declined"
              : "Add context for the record"
          }
        />
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {done && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          Decision saved.
        </p>
      )}

      <Button
        className="mt-4 w-full"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Saving…" : `Confirm: ${selected.label}`}
      </Button>
    </section>
  );
}
