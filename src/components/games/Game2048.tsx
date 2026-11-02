"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createInitialGrid,
  hasMovesLeft,
  hasReached2048,
  move,
  type Direction,
  type Grid,
} from "@/lib/games/game2048";
import { submitScore } from "./submitScore";

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

export function Game2048({ personalBest }: { personalBest: number }) {
  const [grid, setGrid] = useState<Grid>(() => createInitialGrid());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(personalBest);
  const [won, setWon] = useState(false);
  const submittedRef = useRef(false);

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
        if (!won && hasReached2048(result.grid)) setWon(true);
        return result.grid;
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

  function restart() {
    setGrid(createInitialGrid());
    setScore(0);
    setWon(false);
    submittedRef.current = false;
  }

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
        <Button variant="outline" size="sm" onClick={restart}>
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      <div className="relative grid grid-cols-4 gap-2 rounded-2xl bg-neutral-200 p-2 dark:bg-neutral-800">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`flex h-16 w-16 items-center justify-center rounded-lg text-xl font-extrabold sm:h-20 sm:w-20 sm:text-2xl ${
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
            <Button onClick={restart}>Play again</Button>
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
        Use the arrow keys (or WASD) to slide the tiles.
      </p>
    </div>
  );
}
