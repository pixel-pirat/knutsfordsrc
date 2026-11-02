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
import {
  applyMove,
  checkWinner,
  chooseAiMove,
  createInitialBoard,
  getAllLegalMoves,
  getContinuationJumps,
  DEFAULT_RULES,
  DIFFICULTY_DEPTH,
  type Board,
  type Color,
  type Difficulty,
  type Move,
  type RuleOptions,
} from "@/lib/games/draughts";
import { submitScore } from "./submitScore";

type Square = { row: number; col: number };

const STORAGE_KEY = "knutsford-draughts-settings";

type Settings = RuleOptions & { difficulty: Difficulty };

const DEFAULT_SETTINGS: Settings = { ...DEFAULT_RULES, difficulty: "medium" };

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function DraughtsGame() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftSettings, setDraftSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [turn, setTurn] = useState<Color>("red");
  const [selected, setSelected] = useState<Square | null>(null);
  const [locked, setLocked] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const loaded = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR
    setSettings(loaded);
    setDraftSettings(loaded);
    setHydrated(true);
  }, []);

  const rules: RuleOptions = { flyingKings: settings.flyingKings, maximumCapture: settings.maximumCapture };
  const depth = DIFFICULTY_DEPTH[settings.difficulty];

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
    let move = chooseAiMove(current, "black", depth, undefined, rules);
    if (!move) {
      setBoard(current);
      finishGame("red");
      return;
    }
    current = applyMove(current, move);
    let continuation =
      move.captureRow !== null ? getContinuationJumps(current, move.toRow, move.toCol, rules) : [];
    while (continuation.length > 0) {
      const next = chooseAiMove(current, "black", depth, { row: move.toRow, col: move.toCol }, rules);
      if (!next) break;
      move = next;
      current = applyMove(current, move);
      continuation =
        move.captureRow !== null ? getContinuationJumps(current, move.toRow, move.toCol, rules) : [];
    }

    setBoard(current);
    const result = checkWinner(current, "red", rules);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-trigger when it becomes black's turn; board/winner/rules/depth are read fresh via closure
  }, [turn]);

  function applyPlayerMove(move: Move) {
    const nextBoard = applyMove(board, move);
    setBoard(nextBoard);

    const continuation =
      move.captureRow !== null ? getContinuationJumps(nextBoard, move.toRow, move.toCol, rules) : [];
    if (continuation.length > 0) {
      setSelected({ row: move.toRow, col: move.toCol });
      setLocked(true);
      return;
    }

    setSelected(null);
    setLocked(false);
    const result = checkWinner(nextBoard, "black", rules);
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
        ? getContinuationJumps(board, selected.row, selected.col, rules)
        : getAllLegalMoves(board, "red", rules).filter(
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

  function newGame(nextSettings?: Settings) {
    setBoard(createInitialBoard());
    setTurn("red");
    setSelected(null);
    setLocked(false);
    setWinner(null);
    setAiThinking(false);
    submittedRef.current = false;
    if (nextSettings) setSettings(nextSettings);
  }

  function saveSettings() {
    setSettingsOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftSettings));
    } catch {
      // ignore — settings just won't persist across sessions
    }
    newGame(draftSettings);
  }

  const legalDestinations = selected
    ? (locked
        ? getContinuationJumps(board, selected.row, selected.col, rules)
        : getAllLegalMoves(board, "red", rules).filter(
            (m) => m.fromRow === selected.row && m.fromCol === selected.col
          )
      ).map((m) => `${m.toRow}-${m.toCol}`)
    : [];

  if (!hydrated) return null;

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDraftSettings(settings);
              setSettingsOpen(true);
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => newGame()}>
            New game
          </Button>
        </div>
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
        are mandatory when available
        {settings.flyingKings ? " · flying kings" : ""}
        {settings.maximumCapture ? " · maximum capture" : ""}.
      </p>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Draughts settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink dark:text-neutral-100">
                Difficulty
              </p>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDraftSettings((s) => ({ ...s, difficulty: level }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                      draftSettings.difficulty === level
                        ? "border-gold bg-gold/15 text-gold-dark dark:text-gold-light"
                        : "border-black/10 text-neutral-500 hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
              <input
                type="checkbox"
                checked={draftSettings.flyingKings}
                onChange={(e) => setDraftSettings((s) => ({ ...s, flyingKings: e.target.checked }))}
              />
              <span>
                Flying kings
                <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                  Kings move and capture any distance along a diagonal (international rules)
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
              <input
                type="checkbox"
                checked={draftSettings.maximumCapture}
                onChange={(e) => setDraftSettings((s) => ({ ...s, maximumCapture: e.target.checked }))}
              />
              <span>
                Maximum capture
                <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                  When several capture sequences exist, you must take the one that captures the most
                </span>
              </span>
            </label>

            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Changing settings starts a new game.
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
