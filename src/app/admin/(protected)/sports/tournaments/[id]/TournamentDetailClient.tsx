"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { roundLabel } from "@/lib/tournament";

type Participant = {
  id: string;
  seed: number;
  groupLabel: string | null;
  name: string;
  indexNumber: string;
};

type Match = {
  id: string;
  stage: string;
  groupLabel: string | null;
  round: number;
  matchIndex: number;
  participantAId: string | null;
  participantBId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  status: string;
  scheduledAt: string | null;
  venue: string | null;
};

type StandingsRow = {
  participantId: string;
  name: string;
  groupLabel: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scored: number;
  conceded: number;
  points: number;
};

type Tournament = {
  id: string;
  name: string;
  sport: string | null;
  description: string | null;
  format: string;
  status: string;
  eventId: string | null;
  numberOfGroups: number | null;
  qualifiersPerGroup: number | null;
  bracketRounds: number | null;
  championName: string | null;
};

function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TournamentDetailClient({
  tournament,
  participants: initialParticipants,
  matches: initialMatches,
  standings,
  namesById,
}: {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
  standings: StandingsRow[];
  namesById: Record<string, string>;
}) {
  const router = useRouter();
  const participants = initialParticipants;
  const matches = initialMatches;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // participant adding
  const [addOpen, setAddOpen] = useState(false);
  const [pickedStudents, setPickedStudents] = useState<
    { studentId: string; indexNumber: string; firstName: string; lastName: string }[]
  >([]);
  const [manualQuery, setManualQuery] = useState("");
  const [manualResults, setManualResults] = useState<
    { studentId: string; indexNumber: string; firstName: string; lastName: string }[]
  >([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pool, setPool] = useState<
    { studentId: string; indexNumber: string; firstName: string; lastName: string }[]
  >([]);
  const [loadingPool, setLoadingPool] = useState(false);

  function openAdd() {
    setAddOpen(true);
    if (!tournament.eventId) return;
    setLoadingPool(true);
    setPool([]);
    fetch(
      `/api/admin/sports/tournaments/${tournament.id}/search-students?eventId=${tournament.eventId}`
    )
      .then((r) => r.json())
      .then((d) => setPool(d.students ?? []))
      .catch(() => setPool([]))
      .finally(() => setLoadingPool(false));
  }

  const formatLabel =
    tournament.format === "single_elimination"
      ? "Single elimination"
      : tournament.format === "round_robin"
        ? "Round robin"
        : "Group stage + knockout";

  // group stage matches for display
  const groupMatches = useMemo(
    () => matches.filter((m) => m.stage === "group" && m.scheduledAt !== undefined),
    [matches]
  );
  const knockoutMatches = useMemo(
    () => matches.filter((m) => m.stage === "knockout"),
    [matches]
  );

  const groupLabelsByMatch = useMemo(() => {
    const set = new Set<string>();
    for (const m of groupMatches) if (m.groupLabel) set.add(m.groupLabel);
    return [...set].sort();
  }, [groupMatches]);

  const knockoutRounds = useMemo(() => {
    const set = new Map<number, Match[]>();
    for (const m of knockoutMatches) {
      set.set(m.round, [...(set.get(m.round) ?? []), m]);
    }
    return [...set.entries()].sort((a, b) => a[0] - b[0]);
  }, [knockoutMatches]);

  async function generatePairings() {
    if (
      !confirm(
        "Generate pairings from the participants listed below? Existing unfinished matches get replaced; recorded results are kept."
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sports/tournaments/${tournament.id}/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate pairings");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function advanceGroups() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sports/tournaments/${tournament.id}/advance`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not build the knockout bracket");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function pullEventParticipants() {
    if (!tournament.eventId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/sports/tournaments/${tournament.id}/search-students?eventId=${tournament.eventId}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load confirmed participants");
        return;
      }
      const all: { studentId: string }[] = data.students ?? [];
      if (all.length === 0) {
        setError("No confirmed participants found on the linked activity yet.");
        return;
      }
      const post = await fetch(`/api/admin/sports/tournaments/${tournament.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: all.map((s) => s.studentId) }),
      });
      if (!post.ok) {
        const dataPost = await post.json();
        setError(dataPost.error ?? "Could not add participants");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function addPicked() {
    if (pickedStudents.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sports/tournaments/${tournament.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: pickedStudents.map((s) => s.studentId),
        }),
      });
      if (res.ok) {
        setPickedStudents([]);
        setAddOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Could not add participants");
      }
    } finally {
      setBusy(false);
    }
  }

  async function searchManual() {
    if (!manualQuery.trim()) return;
    const res = await fetch(
      `/api/admin/sports/tournaments/${tournament.id}/search-students?q=${encodeURIComponent(manualQuery.trim())}`
    );
    const data = await res.json();
    setManualResults(data.students ?? []);
  }

  async function removeParticipant(participantId: string) {
    if (
      !confirm(
        "Remove this participant? Their matches are unpaired; recorded results for the tournament are kept."
      )
    )
      return;
    setRemovingId(participantId);
    try {
      const res = await fetch(`/api/admin/sports/tournaments/${tournament.id}/participants`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  const pendingCount = matches.filter((m) => m.status === "pending").length;
  const allGroupsDone =
    groupMatches.length > 0 && groupMatches.every((m) => m.status === "completed");

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/sports/tournaments"
          className="text-sm font-medium text-gold-dark dark:text-gold-light hover:underline"
        >
          ← Tournaments
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
              {tournament.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {formatLabel}
              {tournament.sport ? ` · ${tournament.sport}` : ""} · {participants.length}{" "}
              participants{tournament.championName ? ` · Champion: ${tournament.championName}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {tournament.eventId && (
              <Button variant="outline" onClick={pullEventParticipants} disabled={busy}>
                Pull confirmed participants
              </Button>
            )}
            <Button onClick={openAdd}>Add participants</Button>
            <Button onClick={generatePairings} disabled={busy || participants.length < 2}>
              {busy ? "Working…" : "Generate pairings"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          {error}
        </p>
      )}

      {/* Participants */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Participants
          </h2>
          {pendingCount > 0 && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {pendingCount} match{pendingCount === 1 ? "" : "es"} pending
            </span>
          )}
        </div>
        {participants.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No participants yet — pull confirmed participants from a linked sport
            activity or add students manually.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-neutral-800"
              >
                <span className="text-xs font-bold text-neutral-300 dark:text-neutral-600">
                  #{p.seed}
                </span>
                <span className="font-medium text-ink dark:text-neutral-100">{p.name}</span>
                {p.groupLabel && (
                  <Badge
                    variant="outline"
                    className="border-gold/40 bg-gold/10 text-gold-dark dark:text-gold-light"
                  >
                    Group {p.groupLabel}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  disabled={removingId === p.id}
                  className="text-neutral-300 hover:text-red-500 disabled:opacity-50"
                  aria-label={`Remove ${p.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group standings */}
      {standings.length > 0 && (
        <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Standings
            </h2>
            {tournament.format === "group_knockout" && (
              <Button size="sm" variant="outline" onClick={advanceGroups} disabled={busy || !allGroupsDone}>
                Build knockout bracket
              </Button>
            )}
          </div>
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {standings.map((s) => (
              <li key={s.participantId} className="flex items-center gap-3 px-5 py-3">
                <span className="w-28 text-sm font-semibold text-ink dark:text-neutral-100">
                  {s.name}
                </span>
                {s.groupLabel && (
                  <Badge
                    variant="outline"
                    className="border-gold/40 bg-gold/10 text-gold-dark dark:text-gold-light"
                  >
                    {tourneyGroupLabel(s.groupLabel)}
                  </Badge>
                )}
                <div className="ml-auto flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>P {s.played}</span>
                  <span>W {s.won}</span>
                  <span>D {s.drawn}</span>
                  <span>L {s.lost}</span>
                  <span>
                    {s.scored}:{s.conceded}
                  </span>
                  <span className="font-bold text-ink dark:text-neutral-100">
                    {s.points} pts
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matches */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <div className="border-b border-black/5 px-5 py-4 dark:border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Matches
          </h2>
        </div>
        {matches.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No pairings yet — add participants and generate pairings.
          </p>
        ) : (
          <div className="space-y-6 px-5 py-5">
            {[...groupLabelsByMatch].length > 0 &&
              [...groupLabelsByMatch, ...(["", "__KO"] as string[])].map(
                (label) => {
                  if (label === "__KO") {
                    return knockoutRounds.map(([round, roundMatches]) => (
                      <MatchRound
                        key={`ko-${round}`}
                        title={roundLabel(round, tournament.bracketRounds)}
                        matches={roundMatches}
                        namesById={namesById}
                        onEdit={setEditingMatch}
                      />
                    ));
                  }
                  if (label === "") {
                    // league matches without a group
                    const league = groupMatches.filter((m) => !m.groupLabel);
                    if (league.length === 0) return null;
                    return (
                      <MatchRound
                        key="league"
                        title="League matches"
                        matches={league}
                        namesById={namesById}
                        onEdit={setEditingMatch}
                      />
                    );
                  }
                  const groupM = groupMatches.filter((m) => m.groupLabel === label);
                  return (
                    <MatchRound
                      key={`g-${label}`}
                      title={`Group ${label}`}
                      matches={groupM}
                      namesById={namesById}
                      onEdit={setEditingMatch}
                    />
                  );
                }
              )}
          </div>
        )}
      </div>

      {/* Edit match dialog */}
      <MatchDialog
        match={editingMatch}
        namesById={namesById}
        open={Boolean(editingMatch)}
        onOpenChange={(open) => {
          if (!open) setEditingMatch(null);
        }}
        onSuccess={() => {
          setEditingMatch(null);
          router.refresh();
        }}
      />

      {/* Add participants dialog */}
      <AddParticipantsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        linkedEventId={tournament.eventId}
        pickedStudents={pickedStudents}
        setPickedStudents={setPickedStudents}
        manualQuery={manualQuery}
        setManualQuery={setManualQuery}
        manualResults={manualResults}
        onSearch={searchManual}
        onAdd={addPicked}
        busy={busy}
        pool={pool}
        loadingPool={loadingPool}
      />
    </div>
  );
}

function tourneyGroupLabel(label: string) {
  return label.length <= 2 ? `Group ${label}` : label;
}

function MatchRound({
  title,
  matches,
  namesById,
  onEdit,
}: {
  title: string;
  matches: Match[];
  namesById: Record<string, string>;
  onEdit: (m: Match) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {title}
      </h3>
      <ul className="space-y-2">
        {matches.map((m) => {
          const nameA = m.participantAId ? (namesById[m.participantAId] ?? "?") : "TBD";
          const nameB = m.participantBId ? (namesById[m.participantBId] ?? "?") : "TBD";
          const hasResult = m.status === "completed" && m.winnerId;
          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-neutral-50 px-4 py-3 dark:border-white/5 dark:bg-neutral-800/60"
            >
              <span className="w-10 shrink-0 text-xs font-bold text-neutral-300 dark:text-neutral-600">
                M{m.matchIndex + 1}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                <span
                  className={`truncate font-medium ${
                    hasResult && m.winnerId === m.participantAId
                      ? "text-ink dark:text-neutral-100"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {nameA}
                </span>
                <span className="shrink-0 rounded bg-white px-2 py-0.5 font-mono text-xs dark:bg-neutral-900">
                  {m.scoreA ?? "–"} : {m.scoreB ?? "–"}
                </span>
                <span
                  className={`truncate font-medium ${
                    hasResult && m.winnerId === m.participantBId
                      ? "text-ink dark:text-neutral-100"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {nameB}
                </span>
              </div>
              {m.scheduledAt && (
                <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                  {new Date(m.scheduledAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {m.venue ? ` · ${m.venue}` : ""}
                </span>
              )}
              <Badge
                variant="outline"
                className={
                  m.status === "completed"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-neutral-200 bg-neutral-100 text-neutral-500"
                }
              >
                {m.status === "completed" ? "Completed" : "Pending"}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => onEdit(m)}>
                {m.status === "completed" ? "Edit" : "Report"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MatchDialog({
  match,
  namesById,
  open,
  onOpenChange,
  onSuccess,
}: {
  match: Match | null;
  namesById: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (match?.id ?? null) : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey && match) {
      setError(null);
      setScoreA(match.scoreA != null ? String(match.scoreA) : "");
      setScoreB(match.scoreB != null ? String(match.scoreB) : "");
      setScheduledAt(toDateTimeLocal(match.scheduledAt));
      setVenue(match.venue ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!match) return;
    setError(null);

    const bothSlots = match.participantAId && match.participantBId;
    const oneScore = (scoreA === "") !== (scoreB === "");
    if (bothSlots && oneScore) {
      setError("Enter both scores, or clear both to only save the schedule.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/sports/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreA: scoreA === "" ? null : Number(scoreA),
          scoreB: scoreB === "" ? null : Number(scoreB),
          scheduledAt: scheduledAt
            ? new Date(scheduledAt).toISOString()
            : null,
          venue: venue === "" ? null : venue,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onSuccess?.();
      onOpenChange(false);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!match) return null;

  const nameA = match.participantAId
    ? (namesById[match.participantAId] ?? "?")
    : "To be decided";
  const nameB = match.participantBId
    ? (namesById[match.participantBId] ?? "?")
    : "To be decided";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report result</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-semibold text-ink dark:text-neutral-100">
            {nameA} <span className="text-neutral-400">vs</span> {nameB}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-scoreA">{nameA} score</Label>
              <Input
                id="m-scoreA"
                type="number"
                min={0}
                className="mt-1.5"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="m-scoreB">{nameB} score</Label>
              <Input
                id="m-scoreB"
                type="number"
                min={0}
                className="mt-1.5"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            The higher score wins. Equal scores count as a draw (league games).
            Saving scores marks the match complete and advances knockout winners.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-scheduled">Scheduled at</Label>
              <Input
                id="m-scheduled"
                type="datetime-local"
                className="mt-1.5"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="m-venue">Venue</Label>
              <Input
                id="m-venue"
                className="mt-1.5"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddParticipantsDialog({
  open,
  onOpenChange,
  linkedEventId,
  pickedStudents,
  setPickedStudents,
  manualQuery,
  setManualQuery,
  manualResults,
  onSearch,
  onAdd,
  busy,
  pool,
  loadingPool,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkedEventId: string | null;
  pickedStudents: {
    studentId: string;
    indexNumber: string;
    firstName: string;
    lastName: string;
  }[];
  setPickedStudents: (
    v: {
      studentId: string;
      indexNumber: string;
      firstName: string;
      lastName: string;
    }[]
  ) => void;
  manualQuery: string;
  setManualQuery: (v: string) => void;
  manualResults: {
    studentId: string;
    indexNumber: string;
    firstName: string;
    lastName: string;
  }[];
  onSearch: () => void;
  onAdd: () => void;
  busy: boolean;
  pool: {
    studentId: string;
    indexNumber: string;
    firstName: string;
    lastName: string;
  }[];
  loadingPool: boolean;
}) {
  function toggle(student: { studentId: string; indexNumber: string; firstName: string; lastName: string }) {
    setPickedStudents(
      pickedStudents.some((p) => p.studentId === student.studentId)
        ? pickedStudents.filter((p) => p.studentId !== student.studentId)
        : [...pickedStudents, student]
    );
  }

  const tagById = new Map(pickedStudents.map((p) => [p.studentId, p]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add participants</DialogTitle>
        </DialogHeader>

        {linkedEventId && (
          <div className="rounded-xl bg-gold/10 px-4 py-3 ring-1 ring-gold/25">
            <p className="text-sm font-semibold text-ink dark:text-neutral-100">
              Confirmed from linked activity
            </p>
            {loadingPool ? (
              <p className="mt-2 text-xs text-neutral-500">Loading…</p>
            ) : pool.length === 0 ? (
              <p className="mt-2 text-xs text-neutral-500">
                No confirmed participants on the linked activity yet.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {pool.map((s) => {
                  const tagged = tagById.get(s.studentId);
                  return (
                    <li key={s.studentId}>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(tagged)}
                          onChange={() => toggle(tagged ?? s)}
                        />
                        <span className="text-ink dark:text-neutral-100">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="text-xs text-neutral-400">{s.indexNumber}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div>
          <Label>Search any student</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              placeholder="Index number or name"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearch();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={onSearch}>
              Search
            </Button>
          </div>
          {manualResults.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {manualResults.map((s) => {
                const tagged = tagById.get(s.studentId);
                return (
                  <li key={s.studentId}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(tagged)}
                        onChange={() => toggle(tagged ?? s)}
                      />
                      <span className="text-ink dark:text-neutral-100">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="text-xs text-neutral-400">{s.indexNumber}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {pickedStudents.length > 0 && (
          <p className="text-sm text-ink dark:text-neutral-100">
            {pickedStudents.length} selected
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={busy || pickedStudents.length === 0}>
            {busy ? "Adding…" : `Add ${pickedStudents.length || ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
