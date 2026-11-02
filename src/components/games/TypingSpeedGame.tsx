"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { randomPassage, type TypingDifficulty } from "@/lib/games/typingPassages";
import { submitScore } from "./submitScore";

const STORAGE_KEY = "knutsford-typing-difficulty";
const DEFAULT_DIFFICULTY: TypingDifficulty = "medium";

function loadDifficulty(): TypingDifficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "easy" || raw === "medium" || raw === "hard" ? raw : DEFAULT_DIFFICULTY;
}

export function TypingSpeedGame({ personalBest }: { personalBest: number }) {
  const [difficulty, setDifficulty] = useState<TypingDifficulty>(DEFAULT_DIFFICULTY);
  const [draftDifficulty, setDraftDifficulty] = useState<TypingDifficulty>(DEFAULT_DIFFICULTY);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const loaded = loadDifficulty();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR
    setDifficulty(loaded);
    setDraftDifficulty(loaded);
    setPassage(randomPassage(loaded));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const interval = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(interval);
  }, [startedAt, finishedAt]);

  const done = typed.length >= passage.length && passage.length > 0;

  useEffect(() => {
    if (done && !finishedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- stamps completion time once the passage is fully typed, derived from an external clock
      setFinishedAt(Date.now());
    }
  }, [done, finishedAt]);

  const correctChars = [...typed].filter((ch, i) => ch === passage[i]).length;
  const totalMs = finishedAt && startedAt ? finishedAt - startedAt : elapsed;
  const wpm = totalMs > 0 ? Math.round(correctChars / 5 / (totalMs / 60000)) : 0;
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;

  useEffect(() => {
    if (finishedAt && !submittedRef.current) {
      submittedRef.current = true;
      void submitScore("typing", wpm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- submit once, right when finishedAt is set; wpm is read fresh via closure
  }, [finishedAt]);

  function handleChange(value: string) {
    if (done) return;
    if (!startedAt && value.length > 0) setStartedAt(Date.now());
    setTyped(value.slice(0, passage.length));
  }

  function newPassage(forDifficulty: TypingDifficulty = difficulty) {
    setPassage(randomPassage(forDifficulty));
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    setElapsed(0);
    submittedRef.current = false;
    inputRef.current?.focus();
  }

  function saveSettings() {
    setSettingsOpen(false);
    setDifficulty(draftDifficulty);
    try {
      window.localStorage.setItem(STORAGE_KEY, draftDifficulty);
    } catch {
      // ignore — setting just won't persist across sessions
    }
    newPassage(draftDifficulty);
  }

  if (!hydrated) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-xl items-center justify-between gap-3">
        <div className="rounded-xl bg-white px-4 py-2 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">WPM</p>
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">{wpm}</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Accuracy</p>
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">{accuracy}%</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Best WPM</p>
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">{personalBest}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDraftDifficulty(difficulty);
              setSettingsOpen(true);
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => newPassage()}>
            {done ? "Try again" : "New text"}
          </Button>
        </div>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full max-w-xl cursor-text rounded-2xl bg-white p-5 font-mono text-lg leading-relaxed tracking-wide ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        {[...passage].map((char, i) => {
          const typedChar = typed[i];
          const state =
            typedChar === undefined ? "pending" : typedChar === char ? "correct" : "incorrect";
          return (
            <span
              key={i}
              className={
                state === "correct"
                  ? "text-green-600 dark:text-green-400"
                  : state === "incorrect"
                    ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    : i === typed.length
                      ? "border-b-2 border-gold text-neutral-400 dark:text-neutral-500"
                      : "text-neutral-400 dark:text-neutral-500"
              }
            >
              {char}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => handleChange(e.target.value)}
        disabled={done}
        autoFocus
        className="w-full max-w-xl rounded-xl border border-black/10 bg-white px-4 py-2.5 font-mono text-base text-ink outline-none focus:border-gold disabled:opacity-50 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        placeholder="Start typing here…"
      />

      {done && (
        <div className="w-full max-w-xl rounded-2xl bg-gold/10 p-4 text-center ring-1 ring-gold/25">
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">
            {wpm} WPM · {accuracy}% accuracy
          </p>
        </div>
      )}

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Type the passage above as fast and accurately as you can. Difficulty: {difficulty}.
      </p>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Typing Speed settings</DialogTitle>
          </DialogHeader>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink dark:text-neutral-100">
              Difficulty
            </p>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as TypingDifficulty[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDraftDifficulty(level)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                    draftDifficulty === level
                      ? "border-gold bg-gold/15 text-gold-dark dark:text-gold-light"
                      : "border-black/10 text-neutral-500 hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
              Changes the length and complexity of the passage. Starts a new one.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>Save &amp; restart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
