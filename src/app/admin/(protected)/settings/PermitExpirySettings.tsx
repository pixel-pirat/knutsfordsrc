"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PermitExpirySettings({ initialDate }: { initialDate: string | null }) {
  const [date, setDate] = useState(initialDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!date) {
      setError("Select an expiry date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/permit-expiry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(
        `Saved. ${data.updatedCount} active/pending permit${data.updatedCount === 1 ? "" : "s"} updated to this date. Already-expired permits were left alone.`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        This is the single expiry date used for every permit. Saving immediately updates every
        currently active or pending permit to this date — new permits also use it. Permits that
        have already expired are left as expired and are not affected.
      </p>
      <form onSubmit={handleSubmit} className="flex max-w-xs flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <Label htmlFor="permitExpiryDate">Expiry Date</Label>
          <Input
            id="permitExpiryDate"
            type="date"
            className="mt-1.5"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-6">
          {loading ? "Applying…" : "Apply to All Permits"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700 dark:text-green-400">{success}</p>}
    </div>
  );
}
