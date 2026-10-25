"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Action = "flag" | "remove" | "restore";

const ACTIONS: {
  value: Action;
  label: string;
  description: string;
  needsReason: boolean;
}[] = [
  {
    value: "flag",
    label: "Request Correction",
    description:
      "Hide the listing and ask the seller to fix a policy or quality issue",
    needsReason: true,
  },
  {
    value: "remove",
    label: "Remove Listing",
    description: "Take the listing down for a serious policy violation",
    needsReason: true,
  },
  {
    value: "restore",
    label: "Restore / Approve Listing",
    description: "Make the listing active on the marketplace again",
    needsReason: false,
  },
];

function defaultAction(status: string): Action {
  return status === "active" ? "flag" : "restore";
}

export function ListingModerationPanel({
  type,
  listingId,
  status,
  existingReason,
}: {
  type: "product" | "service";
  listingId: string;
  status: string;
  existingReason: string | null;
}) {
  const router = useRouter();
  const [action, setAction] = useState<Action>(() => defaultAction(status));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selected = ACTIONS.find((option) => option.value === action) ?? ACTIONS[0];

  const availableActions = ACTIONS.filter((option) => {
    if (status === "active") return option.value !== "restore";
    if (status === "removed") return option.value === "restore";
    return true;
  });

  async function handleSubmit() {
    setError(null);
    if (selected.needsReason && reason.trim().length === 0) {
      setError("Please provide a reason for this action.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/marketplace/listings/${type}/${listingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, reason: reason.trim() }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setReason("");
      setAction(action === "restore" ? "flag" : "restore");
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
        Listing controls
      </h2>

      {existingReason && status !== "active" && (
        <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2.5 text-xs text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          Current reason: {existingReason}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {availableActions.map((option) => (
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
              name="listing-action"
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

      {selected.needsReason && (
        <div className="mt-4">
          <Label htmlFor="listing-reason">Reason (shown to seller)</Label>
          <Textarea
            id="listing-reason"
            className="mt-1.5"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what needs to change or why the listing is being removed"
          />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {done && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          Listing updated.
        </p>
      )}

      <Button className="mt-4 w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving…" : selected.label}
      </Button>
    </section>
  );
}
