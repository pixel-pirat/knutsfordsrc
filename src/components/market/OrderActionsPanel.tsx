"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/marketplace";
import { allowedOrderStatuses } from "@/lib/orderWorkflow";

const PAYMENT_OPTIONS = [
  "unpaid",
  "pending_confirmation",
  "paid",
  "refunded",
] as const;

export function OrderActionsPanel({
  orderNumber,
  status,
  paymentStatus,
  paymentReference,
  endpoint,
  mode,
}: {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentReference: string | null;
  endpoint: string;
  mode: "seller" | "admin";
}) {
  const router = useRouter();
  const nextStatuses = allowedOrderStatuses(status);
  const [nextStatus, setNextStatus] = useState<string>(nextStatuses[0] ?? "");
  const [statusNote, setStatusNote] = useState("");
  const [nextPaymentStatus, setNextPaymentStatus] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [reference, setReference] = useState(paymentReference ?? "");
  const [submitting, setSubmitting] = useState<"status" | "payment" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const sellerPaymentOptions =
    paymentStatus === "unpaid"
      ? (["paid"] as const)
      : paymentStatus === "pending_confirmation"
        ? (["paid", "unpaid"] as const)
        : ([] as const);

  const paymentOptions =
    mode === "admin" ? PAYMENT_OPTIONS : sellerPaymentOptions;
  const selectedPayment =
    nextPaymentStatus ||
    (paymentOptions.length === 1 ? paymentOptions[0] : "");

  async function submit(
    kind: "status" | "payment",
    body: Record<string, string>
  ) {
    setError(null);
    setSaved(null);
    setSubmitting(kind);

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not update this order.");
        return;
      }
      setSaved(kind === "status" ? "Order status updated." : "Payment updated.");
      setStatusNote("");
      setPaymentNote("");
      router.refresh();
    } catch {
      setError("Could not update this order. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  function handleStatus(event: React.FormEvent) {
    event.preventDefault();
    if (!nextStatus) return;
    if (nextStatus === "cancelled" && statusNote.trim().length === 0) {
      setError("Please give a reason for cancelling this order.");
      return;
    }
    void submit("status", {
      action: "status",
      status: nextStatus,
      note: statusNote.trim(),
    });
  }

  function handlePayment(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedPayment) return;
    void submit("payment", {
      action: "payment",
      paymentStatus: selectedPayment,
      reference: reference.trim(),
      note: paymentNote.trim(),
    });
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
        Manage order
      </h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Order {orderNumber}
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

      {nextStatuses.length > 0 ? (
        <form onSubmit={handleStatus} className="mt-4 space-y-3">
          <div>
            <Label htmlFor={`status-${orderNumber}`}>Order status</Label>
            <select
              id={`status-${orderNumber}`}
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
              className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {nextStatuses.map((value) => (
                <option key={value} value={value}>
                  {ORDER_STATUS_LABELS[value] ?? value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor={`status-note-${orderNumber}`}>
              {nextStatus === "cancelled"
                ? "Cancellation reason"
                : "Note (optional)"}
            </Label>
            <Textarea
              id={`status-note-${orderNumber}`}
              className="mt-1.5"
              rows={2}
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              maxLength={500}
              placeholder={
                nextStatus === "cancelled"
                  ? "Explain why this order is being cancelled"
                  : "Add context for the buyer"
              }
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting !== null}
          >
            {submitting === "status" ? "Updating…" : "Update order status"}
          </Button>
        </form>
      ) : (
        <p className="mt-4 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-500 dark:bg-neutral-800/70 dark:text-neutral-400">
          This order is closed. No further status changes are available.
        </p>
      )}

      {paymentOptions.length > 0 ? (
        <form
          onSubmit={handlePayment}
          className="mt-5 space-y-3 border-t border-black/5 pt-5 dark:border-white/10"
        >
          <div>
            <Label htmlFor={`payment-${orderNumber}`}>Payment</Label>
            {paymentOptions.length === 1 ? (
              <p className="mt-1.5 rounded-lg bg-neutral-50 px-3 py-2 text-sm font-semibold text-ink dark:bg-neutral-800/70 dark:text-neutral-100">
                {PAYMENT_STATUS_LABELS[paymentOptions[0]] ?? paymentOptions[0]}
              </p>
            ) : (
              <select
                id={`payment-${orderNumber}`}
                value={selectedPayment}
                onChange={(event) =>
                  setNextPaymentStatus(event.target.value)
                }
                className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="" disabled>
                  Choose a payment status
                </option>
                {paymentOptions.map((value) => (
                  <option key={value} value={value}>
                    {PAYMENT_STATUS_LABELS[value] ?? value}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <Label htmlFor={`payment-reference-${orderNumber}`}>
              Payment reference (optional)
            </Label>
            <Input
              id={`payment-reference-${orderNumber}`}
              className="mt-1.5"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Transaction ID or receipt number"
              maxLength={120}
            />
          </div>

          <div>
            <Label htmlFor={`payment-note-${orderNumber}`}>
              Payment note (optional)
            </Label>
            <Textarea
              id={`payment-note-${orderNumber}`}
              className="mt-1.5"
              rows={2}
              value={paymentNote}
              onChange={(event) => setPaymentNote(event.target.value)}
              maxLength={500}
              placeholder="Add context for the buyer"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={submitting !== null || !selectedPayment}
          >
            {submitting === "payment" ? "Updating…" : "Update payment"}
          </Button>
        </form>
      ) : (
        <p className="mt-5 border-t border-black/5 pt-5 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
          Payment is marked as{" "}
          {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}. No seller
          payment changes are available.
        </p>
      )}
    </section>
  );
}
