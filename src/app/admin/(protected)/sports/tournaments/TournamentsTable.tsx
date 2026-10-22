"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TournamentDialog } from "./TournamentDialog";

export type TournamentRow = {
  id: string;
  name: string;
  sport: string | null;
  format: string;
  status: string;
  championName: string | null;
  eventTitle: string | null;
  participantCount: number;
  matchCount: number;
};

function formatLabel(format: string) {
  switch (format) {
    case "single_elimination":
      return "Single elimination";
    case "round_robin":
      return "Round robin";
    case "group_knockout":
      return "Groups + knockout";
    default:
      return format;
  }
}

export function TournamentsTable({
  tournaments,
}: {
  tournaments: TournamentRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(
    () => searchParams.get("new") === "1"
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Tournaments
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Create tournaments, auto-pair confirmed participants and track results
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New Tournament</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Matches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-neutral-400 dark:text-neutral-500"
                >
                  No tournaments yet.
                </TableCell>
              </TableRow>
            )}
            {tournaments.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">
                  <Link
                    href={`/admin/sports/tournaments/${t.id}`}
                    className="hover:text-gold-dark dark:hover:text-gold-light hover:underline"
                  >
                    {t.name}
                  </Link>
                  <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                    {t.sport ?? "General"}
                    {t.eventTitle ? ` · from ${t.eventTitle}` : ""}
                    {t.championName ? ` · Champion: ${t.championName}` : ""}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {formatLabel(t.format)}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {t.participantCount}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {t.matchCount}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      t.status === "completed"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : t.status === "active"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {t.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    render={<Link href={`/admin/sports/tournaments/${t.id}`} />}
                    variant="outline"
                    size="sm"
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TournamentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
