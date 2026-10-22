"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HallBookingButton({
  eventId,
  booked,
  bookingSummary,
}: {
  eventId: string;
  booked: boolean;
  bookingSummary: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/hall/bookings", {
        method: booked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0 text-right">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        disabled={busy}
        className={
          booked
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40"
            : ""
        }
      >
        {busy ? "Saving…" : booked ? "Booked ✓" : "Book a seat"}
      </Button>
      <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
        {bookingSummary}
      </p>
      {error && (
        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
