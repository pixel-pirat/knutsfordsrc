"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/marketplace";
import { COMPLAINT_CATEGORY_VALUES } from "@/lib/complaintWorkflow";

export function FileComplaintForm({ orderNumber }: { orderNumber: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<
    (typeof COMPLAINT_CATEGORY_VALUES)[number]
  >(COMPLAINT_CATEGORY_VALUES[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  if (reference) {
    return (
      <div className="rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
        <p className="font-semibold">Complaint filed.</p>
        <p className="mt-1">
          Reference {reference}. Track it on{" "}
          <Link
            href={`/dashboard/market/complaints/${reference}`}
            className="underline"
          >
            your complaints page
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Flag className="h-4 w-4" />
        Report a problem with this order
      </Button>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/marketplace/orders/${encodeURIComponent(orderNumber)}/complaint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, subject, description, evidence }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not file your complaint.");
        return;
      }
      setReference(data.referenceNumber);
    } catch {
      setError("Could not file your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor={`complaint-category-${orderNumber}`}>Category</Label>
        <select
          id={`complaint-category-${orderNumber}`}
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as (typeof COMPLAINT_CATEGORY_VALUES)[number])
          }
          className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {COMPLAINT_CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {COMPLAINT_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor={`complaint-subject-${orderNumber}`}>Subject</Label>
        <Input
          id={`complaint-subject-${orderNumber}`}
          className="mt-1.5"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Short summary of the issue"
          maxLength={150}
          required
        />
      </div>

      <div>
        <Label htmlFor={`complaint-description-${orderNumber}`}>
          What happened?
        </Label>
        <Textarea
          id={`complaint-description-${orderNumber}`}
          className="mt-1.5"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the issue in detail"
          maxLength={2000}
          required
        />
      </div>

      <div>
        <Label htmlFor={`complaint-evidence-${orderNumber}`}>
          Supporting evidence (optional)
        </Label>
        <Textarea
          id={`complaint-evidence-${orderNumber}`}
          className="mt-1.5"
          rows={2}
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
          placeholder="Links, receipt details or anything else that supports your complaint"
          maxLength={1000}
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit complaint"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
