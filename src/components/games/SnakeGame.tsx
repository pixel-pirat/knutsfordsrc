"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { submitScore } from "./submitScore";

const GRID = 20;
const CELL = 20;
const CANVAS_SIZE = GRID * CELL;

type Difficulty = "easy" | "medium" | "hard";
const TICK_MS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 160, medium: 120, hard: 80 };
const STORAGE_KEY = "knutsford-snake-difficulty";
const DEFAULT_DIFFICULTY: Difficulty = "medium";

type Point = { x: number; y: number };

const KEY_DIRECTIONS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((p) => p.x === food.x && p.y === food.y));
  return food;
}

function loadDifficulty(): Difficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "easy" || raw === "medium" || raw === "hard" ? raw : DEFAULT_DIFFICULTY;
}

const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];

export function SnakeGame({ personalBest }: { personalBest: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>(randomFood(INITIAL_SNAKE));
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(personalBest);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const submittedRef = useRef(false);

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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(foodRef.current.x * CELL, foodRef.current.y * CELL, CELL - 1, CELL - 1);

    snakeRef.current.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";
      ctx.fillRect(segment.x * CELL, segment.y * CELL, CELL - 1, CELL - 1);
    });
  }, []);

  const tick = useCallback(() => {
    directionRef.current = nextDirectionRef.current;
    const head = snakeRef.current[0];
    const newHead = {
      x: head.x + directionRef.current.x,
      y: head.y + directionRef.current.y,
    };

    const hitWall = newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID;
    const hitSelf = snakeRef.current.some((p) => p.x === newHead.x && p.y === newHead.y);
    if (hitWall || hitSelf) {
      setRunning(false);
      setGameOver(true);
      return;
    }

    const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const newSnake = [newHead, ...snakeRef.current];
    if (ateFood) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      setBest((b) => Math.max(b, scoreRef.current));
      foodRef.current = randomFood(newSnake);
    } else {
      newSnake.pop();
    }
    snakeRef.current = newSnake;
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(tick, TICK_MS_BY_DIFFICULTY[difficulty]);
    return () => clearInterval(interval);
  }, [running, tick, difficulty]);

  const handleDirectionInput = useCallback(
    (next: Point) => {
      const current = directionRef.current;
      if (next.x === -current.x && next.y === -current.y) return;
      nextDirectionRef.current = next;
      if (!running && !gameOver) setRunning(true);
    },
    [running, gameOver]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const next = KEY_DIRECTIONS[e.key];
      if (!next) return;
      e.preventDefault();
      handleDirectionInput(next);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDirectionInput]);

  useEffect(() => {
    if (gameOver && !submittedRef.current) {
      submittedRef.current = true;
      void submitScore("snake", scoreRef.current);
    }
  }, [gameOver]);

  function restart() {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = randomFood(snakeRef.current);
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    submittedRef.current = false;
    draw();
    setRunning(true);
  }

  function saveSettings() {
    setSettingsOpen(false);
    setDifficulty(draftDifficulty);
    try {
      window.localStorage.setItem(STORAGE_KEY, draftDifficulty);
    } catch {
      // ignore — setting just won't persist across sessions
    }
    setRunning(false);
    setGameOver(false);
    restart();
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
          <Button variant="outline" size="sm" onClick={restart}>
            {gameOver ? "Play again" : "Restart"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="max-w-full rounded-2xl ring-1 ring-black/10 dark:ring-white/10"
        />
        {!running && !gameOver && (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 px-6 text-center font-semibold text-white"
          >
            Press an arrow key or tap to start
          </button>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/70 text-white">
            <p className="text-lg font-extrabold">Game over</p>
            <Button onClick={restart}>Play again</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <Button variant="outline" size="icon" onClick={() => handleDirectionInput({ x: 0, y: -1 })}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div />
        <Button variant="outline" size="icon" onClick={() => handleDirectionInput({ x: -1, y: 0 })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleDirectionInput({ x: 0, y: 1 })}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleDirectionInput({ x: 1, y: 0 })}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Eat the red squares — don&apos;t hit the walls or yourself. Difficulty: {difficulty}.
      </p>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Snake settings</DialogTitle>
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
              Changes how fast the snake moves. Starts a new game.
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
