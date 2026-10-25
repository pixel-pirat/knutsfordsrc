"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Action = "suspend" | "reactivate" | "close";

const ACTIONS: {
  value: Action;
  label: string;
  description: string;
  needsReason: boolean;
}[] = [
  {
    value: "suspend",
    label: "Suspend Store",
    description: "Temporarily stop the store from operating",
    needsReason: true,
  },
  {
    value: "reactivate",
    label: "Reactivate",
    description: "Restore the store to active operation",
    needsReason: false,
  },
  {
    value: "close",
    label: "Close Store",
    description: "Permanently close the storefront",
    needsReason: true,
  },
];

export function StoreStatusPanel({
  storeId,
  status,
  existingReason,
}: {
  storeId: string;
  status: string;
  existingReason: string | null;
}) {
  const router = useRouter();
  const [action, setAction] = useState<Action>(
    status === "suspended" ? "reactivate" : "suspend"
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selected = ACTIONS.find((a) => a.value === action) ?? ACTIONS[0];

  async function handleSubmit() {
    setError(null);
    if (selected.needsReason && reason.trim().length === 0) {
      setError("Please provide a reason for this action.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/marketplace/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() }),
      });
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

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
        Store controls
      </h2>

      {status === "suspended" && existingReason && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
          Current suspension: {existingReason}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {ACTIONS.filter((option) =>
          status === "closed" ? option.value === "reactivate" : true
        ).map((option) => (
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
              name="store-action"
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
        <Label htmlFor="store-reason">
          {selected.needsReason ? "Reason (shown to seller)" : "Note (optional)"}
        </Label>
        <Textarea
          id="store-reason"
          className="mt-1.5"
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            selected.needsReason
              ? "Explain why this action is being taken"
              : "Add context for the audit record"
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
          Store updated.
        </p>
      )}

      <Button className="mt-4 w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving…" : selected.label}
      </Button>
    </section>
  );
}
