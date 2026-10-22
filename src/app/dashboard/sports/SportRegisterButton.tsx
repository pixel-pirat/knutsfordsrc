"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SportRegisterButton({
  eventId,
  status,
  confirmed,
}: {
  eventId: string;
  status: string | null;
  confirmed: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sports/registrations", {
        method: status ? "DELETE" : "POST",
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

  if (confirmed) {
    return (
      <div className="shrink-0 text-right">
        <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/40">
          Participation confirmed
        </span>
        {error && (
          <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="shrink-0 text-right">
      <Button variant="outline" size="sm" onClick={toggle} disabled={busy}>
        {busy ? "Saving…" : status === "registered" ? "Withdraw" : "I want to play"}
      </Button>
      {status === "registered" && (
        <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
          Awaiting confirmation
        </p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
