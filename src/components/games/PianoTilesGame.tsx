"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { submitScore } from "./submitScore";

const LANES = 4;
const WIDTH = 320;
const HEIGHT = 420;
const LANE_WIDTH = WIDTH / LANES;
const TILE_HEIGHT = 110;
const MAX_SPEED = 10;

type Difficulty = "easy" | "medium" | "hard";
const FALL_SPEED_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 2.5, medium: 4, hard: 6 };
const SPAWN_MS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 900, medium: 650, hard: 450 };
const STORAGE_KEY = "knutsford-piano-difficulty";
const DEFAULT_DIFFICULTY: Difficulty = "medium";

function loadDifficulty(): Difficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "easy" || raw === "medium" || raw === "hard" ? raw : DEFAULT_DIFFICULTY;
}

type Tile = { lane: number; y: number };

const KEY_LANES: Record<string, number> = { d: 0, f: 1, j: 2, k: 3 };

export function PianoTilesGame({ personalBest }: { personalBest: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const speedRef = useRef(FALL_SPEED_BY_DIFFICULTY[DEFAULT_DIFFICULTY]);
  const lastSpawnLaneRef = useRef(-1);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const submittedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(personalBest);
  const [status, setStatus] = useState<"idle" | "playing" | "lost">("idle");

  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [draftDifficulty, setDraftDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadDifficulty();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR
    setDifficulty(loaded);
    setDraftDifficulty(loaded);
    setHydrated(true);
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#e7e5e4";
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_WIDTH, 0);
      ctx.lineTo(i * LANE_WIDTH, HEIGHT);
      ctx.stroke();
    }

    ctx.fillStyle = "#1c1917";
    for (const tile of tilesRef.current) {
      ctx.fillRect(tile.lane * LANE_WIDTH + 3, tile.y, LANE_WIDTH - 6, TILE_HEIGHT - 6);
    }
  }, []);

  function spawnTile() {
    let lane = Math.floor(Math.random() * LANES);
    if (LANES > 1 && lane === lastSpawnLaneRef.current) {
      lane = (lane + 1 + Math.floor(Math.random() * (LANES - 1))) % LANES;
    }
    lastSpawnLaneRef.current = lane;
    tilesRef.current = [...tilesRef.current, { lane, y: -TILE_HEIGHT }];
  }

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (status !== "playing") return;

    function tick() {
      const next: Tile[] = [];
      let lost = false;
      for (const tile of tilesRef.current) {
        const movedY = tile.y + speedRef.current;
        if (movedY > HEIGHT) {
          lost = true;
          continue;
        }
        next.push({ ...tile, y: movedY });
      }
      tilesRef.current = next;

      if (lost) {
        setStatus("lost");
        draw();
        return;
      }

      draw();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, draw]);

  useEffect(() => {
    if (status !== "playing") return;
    spawnTimerRef.current = setInterval(spawnTile, SPAWN_MS_BY_DIFFICULTY[difficulty]);
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [status, difficulty]);

  function hitLane(lane: number) {
    if (status !== "playing") return;
    const candidates = tilesRef.current.filter((t) => t.lane === lane);
    if (candidates.length === 0) return;
    const closest = candidates.reduce((a, b) => (a.y > b.y ? a : b));
    tilesRef.current = tilesRef.current.filter((t) => t !== closest);
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setBest((b) => Math.max(b, scoreRef.current));
    speedRef.current = Math.min(MAX_SPEED, FALL_SPEED_BY_DIFFICULTY[difficulty] + scoreRef.current * 0.05);
    draw();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const lane = KEY_LANES[e.key];
      if (lane === undefined) return;
      e.preventDefault();
      hitLane(lane);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hitLane reads refs/closure state that's current at call time; re-binding per render is unnecessary
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scale;
    hitLane(Math.min(LANES - 1, Math.max(0, Math.floor(x / LANE_WIDTH))));
  }

  useEffect(() => {
    if (status === "lost" && !submittedRef.current) {
      submittedRef.current = true;
      void submitScore("piano", scoreRef.current);
    }
  }, [status]);

  function start(forDifficulty: Difficulty = difficulty) {
    tilesRef.current = [];
    speedRef.current = FALL_SPEED_BY_DIFFICULTY[forDifficulty];
    lastSpawnLaneRef.current = -1;
    scoreRef.current = 0;
    submittedRef.current = false;
    setScore(0);
    setStatus("playing");
  }

  function saveSettings() {
    setSettingsOpen(false);
    setDifficulty(draftDifficulty);
    try {
      window.localStorage.setItem(STORAGE_KEY, draftDifficulty);
    } catch {
      // ignore — setting just won't persist across sessions
    }
    start(draftDifficulty);
  }

  if (!hydrated) return null;

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
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          className="max-w-full touch-none rounded-2xl ring-1 ring-black/10 dark:ring-white/10"
        />
        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/70 text-white">
            {status === "lost" && <p className="text-lg font-extrabold">Tile missed!</p>}
            <Button onClick={() => start()}>{status === "idle" ? "Start" : "Play again"}</Button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Tap (or D F J K) the lane with a black tile before it reaches the bottom. Difficulty: {difficulty}.
      </p>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Piano Tiles settings</DialogTitle>
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
              Changes how fast tiles fall and how often they spawn. Starts a new game.
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
