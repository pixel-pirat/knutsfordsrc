"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BuyerPaymentActions({
  orderNumber,
  paymentStatus,
  reference,
}: {
  orderNumber: string;
  paymentStatus: string;
  reference: string | null;
}) {
  const router = useRouter();
  const [paymentReference, setPaymentReference] = useState(reference ?? "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (paymentStatus !== "unpaid" && paymentStatus !== "pending_confirmation") {
    return null;
  }

  const alreadySubmitted = paymentStatus === "pending_confirmation";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/marketplace/orders/${encodeURIComponent(orderNumber)}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: paymentReference,
            note,
          }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not submit your payment details.");
        return;
      }
      setSaved(true);
      setNote("");
      router.refresh();
    } catch {
      setError("Could not submit your payment details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      {alreadySubmitted && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          Your payment details were sent. The seller will confirm when the
          payment is received.
        </p>
      )}

      <div>
        <Label htmlFor={`payment-reference-${orderNumber}`}>
          Payment reference
        </Label>
        <Input
          id={`payment-reference-${orderNumber}`}
          className="mt-1.5"
          value={paymentReference}
          onChange={(event) => setPaymentReference(event.target.value)}
          placeholder="Mobile Money transaction ID or receipt number"
          maxLength={120}
          required
        />
      </div>

      <div>
        <Label htmlFor={`payment-note-${orderNumber}`}>Note (optional)</Label>
        <Textarea
          id={`payment-note-${orderNumber}`}
          className="mt-1.5"
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything the seller should know about this payment"
          maxLength={500}
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          Payment details submitted. The seller will confirm your payment.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting
          ? "Submitting…"
          : alreadySubmitted
            ? "Update payment details"
            : "I have made payment"}
      </Button>
    </form>
  );
}
