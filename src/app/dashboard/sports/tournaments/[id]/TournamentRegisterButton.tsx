"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TournamentRegisterButton({
  tournamentId,
  registered,
}: {
  tournamentId: string;
  registered: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sports/tournaments/${tournamentId}/registration`,
        { method: registered ? "DELETE" : "POST" }
      );
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
      <Button variant="outline" size="sm" onClick={toggle} disabled={busy}>
        {busy ? "Saving…" : registered ? "Withdraw" : "Join tournament"}
      </Button>
      {error && (
        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
