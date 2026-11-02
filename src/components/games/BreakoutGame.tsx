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

const WIDTH = 480;
const HEIGHT = 320;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const PADDLE_Y = HEIGHT - 20;
const PADDLE_SPEED = 6;
const BALL_RADIUS = 6;

type Difficulty = "easy" | "medium" | "hard";
const BALL_SPEED_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 6 };
const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 5, medium: 3, hard: 2 };
const STORAGE_KEY = "knutsford-breakout-difficulty";
const DEFAULT_DIFFICULTY: Difficulty = "medium";

function loadDifficulty(): Difficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "easy" || raw === "medium" || raw === "hard" ? raw : DEFAULT_DIFFICULTY;
}

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 16;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 10;
const BRICK_WIDTH =
  (WIDTH - BRICK_OFFSET_LEFT * 2 - BRICK_PADDING * (BRICK_COLS - 1)) / BRICK_COLS;

const ROW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

type Ball = { x: number; y: number; dx: number; dy: number };

function freshBricks(): boolean[][] {
  return Array.from({ length: BRICK_ROWS }, () => Array(BRICK_COLS).fill(true));
}

function freshBall(speed: number): Ball {
  const direction = Math.random() < 0.5 ? -1 : 1;
  return { x: WIDTH / 2, y: HEIGHT - 50, dx: speed * direction, dy: -speed };
}

export function BreakoutGame({ personalBest }: { personalBest: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballSpeedRef = useRef(BALL_SPEED_BY_DIFFICULTY[DEFAULT_DIFFICULTY]);
  const ballRef = useRef<Ball>(freshBall(BALL_SPEED_BY_DIFFICULTY[DEFAULT_DIFFICULTY]));
  const paddleXRef = useRef((WIDTH - PADDLE_WIDTH) / 2);
  const bricksRef = useRef<boolean[][]>(freshBricks());
  const keysRef = useRef({ left: false, right: false });
  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const submittedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(personalBest);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");

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
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    bricksRef.current.forEach((row, r) => {
      row.forEach((active, c) => {
        if (!active) return;
        const x = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
        const y = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
        ctx.fillStyle = ROW_COLORS[r % ROW_COLORS.length];
        ctx.fillRect(x, y, BRICK_WIDTH, BRICK_HEIGHT);
      });
    });

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(paddleXRef.current, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#facc15";
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!running) return;

    function tick() {
      const keys = keysRef.current;
      if (keys.left) paddleXRef.current = Math.max(0, paddleXRef.current - PADDLE_SPEED);
      if (keys.right)
        paddleXRef.current = Math.min(WIDTH - PADDLE_WIDTH, paddleXRef.current + PADDLE_SPEED);

      const ball = ballRef.current;
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x - BALL_RADIUS <= 0 || ball.x + BALL_RADIUS >= WIDTH) ball.dx *= -1;
      if (ball.y - BALL_RADIUS <= 0) ball.dy *= -1;

      if (
        ball.y + BALL_RADIUS >= PADDLE_Y &&
        ball.y + BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT &&
        ball.x >= paddleXRef.current &&
        ball.x <= paddleXRef.current + PADDLE_WIDTH &&
        ball.dy > 0
      ) {
        const hitPos = (ball.x - paddleXRef.current) / PADDLE_WIDTH - 0.5;
        ball.dx = ballSpeedRef.current * hitPos * 2;
        ball.dy = -Math.abs(ball.dy);
      }

      let bricksLeft = 0;
      bricksRef.current.forEach((row, r) => {
        row.forEach((active, c) => {
          if (!active) return;
          bricksLeft++;
          const x = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
          const y = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
          if (
            ball.x + BALL_RADIUS > x &&
            ball.x - BALL_RADIUS < x + BRICK_WIDTH &&
            ball.y + BALL_RADIUS > y &&
            ball.y - BALL_RADIUS < y + BRICK_HEIGHT
          ) {
            row[c] = false;
            bricksLeft--;
            ball.dy *= -1;
            scoreRef.current += (BRICK_ROWS - r) * 10;
            setScore(scoreRef.current);
            setBest((b) => Math.max(b, scoreRef.current));
          }
        });
      });

      if (ball.y - BALL_RADIUS > HEIGHT) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          setStatus("lost");
          setRunning(false);
          draw();
          return;
        }
        ballRef.current = freshBall(ballSpeedRef.current);
        paddleXRef.current = (WIDTH - PADDLE_WIDTH) / 2;
      }

      if (bricksLeft === 0) {
        setStatus("won");
        setRunning(false);
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
  }, [running, draw]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keysRef.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) keysRef.current.right = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keysRef.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keysRef.current.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scale - PADDLE_WIDTH / 2;
    paddleXRef.current = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, x));
  }

  useEffect(() => {
    if ((status === "lost" || status === "won") && !submittedRef.current) {
      submittedRef.current = true;
      void submitScore("breakout", scoreRef.current);
    }
  }, [status]);

  function start(forDifficulty: Difficulty = difficulty) {
    ballSpeedRef.current = BALL_SPEED_BY_DIFFICULTY[forDifficulty];
    ballRef.current = freshBall(ballSpeedRef.current);
    paddleXRef.current = (WIDTH - PADDLE_WIDTH) / 2;
    bricksRef.current = freshBricks();
    scoreRef.current = 0;
    livesRef.current = LIVES_BY_DIFFICULTY[forDifficulty];
    submittedRef.current = false;
    setScore(0);
    setLives(livesRef.current);
    setStatus("playing");
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
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Lives</p>
          <p className="text-lg font-extrabold text-ink dark:text-neutral-100">{lives}</p>
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
          onPointerMove={handlePointerMove}
          className="max-w-full touch-none rounded-2xl ring-1 ring-black/10 dark:ring-white/10"
        />
        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/70 text-white">
            {status === "won" && <p className="text-lg font-extrabold">You cleared the board!</p>}
            {status === "lost" && <p className="text-lg font-extrabold">Game over</p>}
            <Button onClick={() => start()}>{status === "idle" ? "Start" : "Play again"}</Button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Move the paddle with the arrow keys, A/D, or by dragging on the board. Difficulty: {difficulty}.
      </p>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Breakout settings</DialogTitle>
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
              Changes ball speed ({BALL_SPEED_BY_DIFFICULTY.easy}–{BALL_SPEED_BY_DIFFICULTY.hard}) and
              starting lives ({LIVES_BY_DIFFICULTY.hard}–{LIVES_BY_DIFFICULTY.easy}). Starts a new game.
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
