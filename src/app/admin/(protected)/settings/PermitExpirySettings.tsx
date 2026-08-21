"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PermitExpirySettings({ initialDays }: { initialDays: number }) {
  const [days, setDays] = useState(String(initialDays));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = Number(days);
    if (!days || Number.isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
      setError("Enter a whole number of days greater than 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/permit-expiry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-500">
        New permits automatically expire this many days after being issued. Staff issuing
        permits can no longer type a custom expiry date — this keeps every permit consistent
        and prevents mis-entries.
      </p>
      <form onSubmit={handleSubmit} className="flex max-w-xs flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <Label htmlFor="permitExpiryDays">Validity Period (days)</Label>
          <Input
            id="permitExpiryDays"
            type="number"
            min="1"
            step="1"
            className="mt-1.5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-6">
          {loading ? "Saving…" : "Save"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700">Permit expiry policy updated.</p>}
    </div>
  );
}
