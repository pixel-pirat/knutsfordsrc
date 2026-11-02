"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applyMove,
  checkWinner,
  chooseAiMove,
  createInitialBoard,
  getAllLegalMoves,
  getContinuationJumps,
  type Board,
  type Color,
  type Move,
} from "@/lib/games/draughts";
import { submitScore } from "./submitScore";

type Square = { row: number; col: number };

export function DraughtsGame() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [turn, setTurn] = useState<Color>("red");
  const [selected, setSelected] = useState<Square | null>(null);
  const [locked, setLocked] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const submittedRef = useRef(false);

  function finishGame(winnerColor: Color) {
    setWinner(winnerColor);
    setSelected(null);
    setLocked(false);
    if (!submittedRef.current) {
      submittedRef.current = true;
      void submitScore("draughts", winnerColor === "red" ? 100 : 0);
    }
  }

  function runAiTurn(startBoard: Board) {
    let current = startBoard;
    let move = chooseAiMove(current, "black");
    if (!move) {
      setBoard(current);
      finishGame("red");
      return;
    }
    current = applyMove(current, move);
    let continuation =
      move.captureRow !== null ? getContinuationJumps(current, move.toRow, move.toCol) : [];
    while (continuation.length > 0) {
      const next = chooseAiMove(current, "black", 4, { row: move.toRow, col: move.toCol });
      if (!next) break;
      move = next;
      current = applyMove(current, move);
      continuation =
        move.captureRow !== null ? getContinuationJumps(current, move.toRow, move.toCol) : [];
    }

    setBoard(current);
    const result = checkWinner(current, "red");
    if (result) {
      finishGame(result);
      return;
    }
    setTurn("red");
  }

  useEffect(() => {
    if (turn !== "black" || winner) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows a "thinking" delay before the AI's move resolves, not a sync render concern
    setAiThinking(true);
    const timer = setTimeout(() => {
      runAiTurn(board);
      setAiThinking(false);
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-trigger when it becomes black's turn; board/winner are read fresh via closure
  }, [turn]);

  function applyPlayerMove(move: Move) {
    const nextBoard = applyMove(board, move);
    setBoard(nextBoard);

    const continuation =
      move.captureRow !== null ? getContinuationJumps(nextBoard, move.toRow, move.toCol) : [];
    if (continuation.length > 0) {
      setSelected({ row: move.toRow, col: move.toCol });
      setLocked(true);
      return;
    }

    setSelected(null);
    setLocked(false);
    const result = checkWinner(nextBoard, "black");
    if (result) {
      finishGame(result);
      return;
    }
    setTurn("black");
  }

  function handleSquareClick(row: number, col: number) {
    if (winner || turn !== "red" || aiThinking) return;
    const piece = board[row][col];

    if (selected) {
      const candidates = locked
        ? getContinuationJumps(board, selected.row, selected.col)
        : getAllLegalMoves(board, "red").filter(
            (m) => m.fromRow === selected.row && m.fromCol === selected.col
          );
      const match = candidates.find((m) => m.toRow === row && m.toCol === col);
      if (match) {
        applyPlayerMove(match);
        return;
      }
      if (locked) return;
      if (piece && piece.color === "red") {
        setSelected({ row, col });
        return;
      }
      setSelected(null);
      return;
    }

    if (piece && piece.color === "red") {
      setSelected({ row, col });
    }
  }

  function newGame() {
    setBoard(createInitialBoard());
    setTurn("red");
    setSelected(null);
    setLocked(false);
    setWinner(null);
    setAiThinking(false);
    submittedRef.current = false;
  }

  const legalDestinations = selected
    ? (locked
        ? getContinuationJumps(board, selected.row, selected.col)
        : getAllLegalMoves(board, "red").filter(
            (m) => m.fromRow === selected.row && m.fromCol === selected.col
          )
      ).map((m) => `${m.toRow}-${m.toCol}`)
    : [];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-md items-center justify-between gap-3">
        <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-100 dark:ring-white/10">
          {winner
            ? winner === "red"
              ? "You won! 🎉"
              : "The computer won"
            : turn === "red"
              ? locked
                ? "Continue your capture"
                : "Your turn"
              : aiThinking
                ? "Computer is thinking…"
                : "Computer's turn"}
        </div>
        <Button variant="outline" size="sm" onClick={newGame}>
          New game
        </Button>
      </div>

      <div className="grid aspect-square w-full max-w-md grid-cols-8 overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/10">
        {board.map((rowCells, row) =>
          rowCells.map((piece, col) => {
            const dark = (row + col) % 2 === 1;
            const isSelected = selected?.row === row && selected?.col === col;
            const isDestination = legalDestinations.includes(`${row}-${col}`);
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                onClick={() => handleSquareClick(row, col)}
                className={`relative flex aspect-square items-center justify-center ${
                  dark ? "bg-amber-800 dark:bg-neutral-800" : "bg-amber-100 dark:bg-neutral-600"
                } ${isSelected ? "ring-2 ring-inset ring-gold" : ""}`}
              >
                {isDestination && (
                  <span className="absolute h-3 w-3 rounded-full bg-green-500/80" />
                )}
                {piece && (
                  <span
                    className={`flex h-[72%] w-[72%] items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                      piece.color === "red"
                        ? "bg-red-600 text-red-100 ring-2 ring-red-900"
                        : "bg-neutral-50 text-neutral-500 ring-2 ring-neutral-400 dark:bg-neutral-200 dark:ring-neutral-500"
                    }`}
                  >
                    {piece.king ? "★" : ""}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        You play red. Tap a piece, then tap a highlighted square to move. Captures
        are mandatory when available.
      </p>
    </div>
  );
}
