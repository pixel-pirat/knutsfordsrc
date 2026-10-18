"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PermitConfig = {
  defaultAmount?: number;
  currency?: string;
  enablePermitRequest?: boolean;
};

export function PermitConfigSettings({ initial }: { initial: PermitConfig | null }) {
  const [defaultAmount, setDefaultAmount] = useState(initial?.defaultAmount ?? 0);
  const [currency, setCurrency] = useState(initial?.currency ?? "GHS");
  const [enablePermitRequest, setEnablePermitRequest] = useState(
    initial?.enablePermitRequest ?? false
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/permit-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultAmount, currency, enablePermitRequest }),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        The default amount pre-filled when issuing a new permit. Doesn&rsquo;t change permits already issued.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="pc-amount">Default Amount</Label>
          <Input
            id="pc-amount"
            type="number"
            min={0}
            step="0.01"
            className="mt-1.5"
            value={defaultAmount}
            onChange={(e) => setDefaultAmount(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="pc-currency">Currency</Label>
          <Input
            id="pc-currency"
            className="mt-1.5"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
        <input
          type="checkbox"
          checked={enablePermitRequest}
          onChange={(e) => setEnablePermitRequest(e.target.checked)}
        />
        Allow students to request a permit themselves (not yet built — this just stores the flag)
      </label>
      {error && (
        <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 dark:bg-green-950/40 px-3.5 py-2.5 text-sm text-green-700 dark:text-green-400">
          Saved.
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
