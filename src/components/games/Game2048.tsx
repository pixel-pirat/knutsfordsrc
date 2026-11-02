"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createInitialGrid,
  GRID_SIZE_BY_DIFFICULTY,
  hasMovesLeft,
  hasReached2048,
  move,
  spawnRandomTile,
  type Difficulty,
  type Direction,
  type Grid,
} from "@/lib/games/game2048";
import { submitScore } from "./submitScore";

const STORAGE_KEY = "knutsford-2048-difficulty";
const DEFAULT_DIFFICULTY: Difficulty = "medium";

const TILE_COLORS: Record<number, string> = {
  2: "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100",
  4: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
  8: "bg-orange-200 text-white dark:bg-orange-800",
  16: "bg-orange-300 text-white dark:bg-orange-700",
  32: "bg-orange-400 text-white dark:bg-orange-600",
  64: "bg-orange-500 text-white dark:bg-orange-500",
  128: "bg-yellow-300 text-white dark:bg-yellow-600",
  256: "bg-yellow-400 text-white dark:bg-yellow-500",
  512: "bg-yellow-500 text-white dark:bg-yellow-400",
  1024: "bg-red-400 text-white dark:bg-red-500",
  2048: "bg-red-500 text-white dark:bg-red-400",
};

function loadDifficulty(): Difficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "easy" || raw === "medium" || raw === "hard" ? raw : DEFAULT_DIFFICULTY;
}

export function Game2048({ personalBest }: { personalBest: number }) {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [draftDifficulty, setDraftDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [grid, setGrid] = useState<Grid>(() => createInitialGrid(GRID_SIZE_BY_DIFFICULTY[DEFAULT_DIFFICULTY]));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(personalBest);
  const [won, setWon] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const loaded = loadDifficulty();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR
    setDifficulty(loaded);
    setDraftDifficulty(loaded);
    setGrid(createInitialGrid(GRID_SIZE_BY_DIFFICULTY[loaded]));
    setHydrated(true);
  }, []);

  const gameOver = !hasMovesLeft(grid);

  const applyDirection = useCallback(
    (direction: Direction) => {
      if (gameOver) return;
      setGrid((current) => {
        const result = move(current, direction);
        if (!result.moved) return current;
        setScore((s) => {
          const next = s + result.gained;
          setBest((b) => Math.max(b, next));
          return next;
        });
        const next = spawnRandomTile(result.grid);
        if (!won && hasReached2048(next)) setWon(true);
        return next;
      });
    },
    [gameOver, won]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const map: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const direction = map[e.key];
      if (direction) {
        e.preventDefault();
        applyDirection(direction);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyDirection]);

  useEffect(() => {
    if (gameOver && !submittedRef.current) {
      submittedRef.current = true;
      void submitScore("2048", score);
    }
  }, [gameOver, score]);

  function restart(forDifficulty: Difficulty = difficulty) {
    setGrid(createInitialGrid(GRID_SIZE_BY_DIFFICULTY[forDifficulty]));
    setScore(0);
    setWon(false);
    submittedRef.current = false;
  }

  function saveSettings() {
    setSettingsOpen(false);
    setDifficulty(draftDifficulty);
    try {
      window.localStorage.setItem(STORAGE_KEY, draftDifficulty);
    } catch {
      // ignore — setting just won't persist across sessions
    }
    restart(draftDifficulty);
  }

  if (!hydrated) return null;

  const size = GRID_SIZE_BY_DIFFICULTY[difficulty];
  const tileTextClass = size >= 5 ? "text-base sm:text-lg" : size === 4 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-sm items-center justify-between gap-3">
        <div className="rounded-xl bg-white px-4 py-2 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Score</p>
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">{score}</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Best</p>
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">{best}</p>
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
          <Button variant="outline" size="sm" onClick={() => restart()}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="relative grid aspect-square w-full max-w-sm gap-2 rounded-2xl bg-neutral-200 p-2 dark:bg-neutral-800"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`flex aspect-square items-center justify-center rounded-lg font-extrabold ${tileTextClass} ${
                value === 0
                  ? "bg-neutral-100 dark:bg-neutral-900/60"
                  : TILE_COLORS[value] ?? "bg-red-600 text-white"
              }`}
            >
              {value !== 0 && value}
            </div>
          ))
        )}

        {(gameOver || won) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/90 dark:bg-neutral-950/90">
            <p className="text-lg font-extrabold text-ink dark:text-neutral-100">
              {gameOver ? "Game over" : "You reached 2048!"}
            </p>
            <Button onClick={() => restart()}>Play again</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <Button variant="outline" size="icon" onClick={() => applyDirection("up")}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div />
        <Button variant="outline" size="icon" onClick={() => applyDirection("left")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => applyDirection("down")}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => applyDirection("right")}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 sm:block">
        Use the arrow keys (or WASD) to slide the tiles. {size}×{size} board · {difficulty}.
      </p>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>2048 settings</DialogTitle>
          </DialogHeader>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink dark:text-neutral-100">
              Difficulty
            </p>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
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
              Changes the board size: {GRID_SIZE_BY_DIFFICULTY.easy}×{GRID_SIZE_BY_DIFFICULTY.easy}{" "}
              (easy) down to {GRID_SIZE_BY_DIFFICULTY.hard}×{GRID_SIZE_BY_DIFFICULTY.hard} (hard).
              Starts a new game.
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
