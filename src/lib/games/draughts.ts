export type Color = "red" | "black";
export type Piece = { color: Color; king: boolean };
export type Board = (Piece | null)[][];

export type Move = {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  captureRow: number | null;
  captureCol: number | null;
};

export type RuleOptions = {
  /** International-style kings: slide any distance along an empty diagonal, and may capture a
   * piece anywhere along that diagonal, landing on any empty square beyond it. */
  flyingKings: boolean;
  /** When multiple capture sequences are available, only the sequence(s) capturing the most
   * pieces are legal (the standard "majority capture" rule in international draughts). */
  maximumCapture: boolean;
};

export const DEFAULT_RULES: RuleOptions = {
  flyingKings: false,
  maximumCapture: false,
};

export type Difficulty = "easy" | "medium" | "hard";
export const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
};

export const BOARD_SIZE = 8;

const ALL_FOUR: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function inBounds(r: number, c: number) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<Piece | null>(BOARD_SIZE).fill(null)
  );
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 !== 1) continue;
      if (row <= 2) board[row][col] = { color: "black", king: false };
      else if (row >= 5) board[row][col] = { color: "red", king: false };
    }
  }
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

/** Non-capturing move directions: forward-only for men, all four for kings. */
function moveDirections(piece: Piece): [number, number][] {
  if (piece.king) return ALL_FOUR;
  const dr = piece.color === "red" ? -1 : 1;
  return [
    [dr, -1],
    [dr, 1],
  ];
}

function getSimpleMovesForPiece(
  board: Board,
  row: number,
  col: number,
  rules: RuleOptions
): Move[] {
  const piece = board[row][col];
  if (!piece) return [];
  const steps: Move[] = [];

  if (piece.king && rules.flyingKings) {
    for (const [dr, dc] of ALL_FOUR) {
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c) && !board[r][c]) {
        steps.push({ fromRow: row, fromCol: col, toRow: r, toCol: c, captureRow: null, captureCol: null });
        r += dr;
        c += dc;
      }
    }
    return steps;
  }

  for (const [dr, dc] of moveDirections(piece)) {
    const r = row + dr;
    const c = col + dc;
    if (inBounds(r, c) && !board[r][c]) {
      steps.push({ fromRow: row, fromCol: col, toRow: r, toCol: c, captureRow: null, captureCol: null });
    }
  }
  return steps;
}

/** Capture directions are omnidirectional for every piece, men included (standard rule). */
function getJumpsForPiece(
  board: Board,
  row: number,
  col: number,
  rules: RuleOptions
): Move[] {
  const piece = board[row][col];
  if (!piece) return [];
  const jumps: Move[] = [];

  if (piece.king && rules.flyingKings) {
    for (const [dr, dc] of ALL_FOUR) {
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c) && !board[r][c]) {
        r += dr;
        c += dc;
      }
      if (!inBounds(r, c) || board[r][c]!.color === piece.color) continue;

      const captureRow = r;
      const captureCol = c;
      let lr = r + dr;
      let lc = c + dc;
      while (inBounds(lr, lc) && !board[lr][lc]) {
        jumps.push({
          fromRow: row,
          fromCol: col,
          toRow: lr,
          toCol: lc,
          captureRow,
          captureCol,
        });
        lr += dr;
        lc += dc;
      }
    }
    return jumps;
  }

  for (const [dr, dc] of ALL_FOUR) {
    const midR = row + dr;
    const midC = col + dc;
    const landR = row + dr * 2;
    const landC = col + dc * 2;
    if (
      inBounds(landR, landC) &&
      !board[landR][landC] &&
      inBounds(midR, midC) &&
      board[midR][midC] &&
      board[midR][midC]!.color !== piece.color
    ) {
      jumps.push({
        fromRow: row,
        fromCol: col,
        toRow: landR,
        toCol: landC,
        captureRow: midR,
        captureCol: midC,
      });
    }
  }
  return jumps;
}

/** Legal moves for a single piece — jumps only if any are available for it. */
export function getMovesForPiece(
  board: Board,
  row: number,
  col: number,
  rules: RuleOptions = DEFAULT_RULES
): Move[] {
  const jumps = getJumpsForPiece(board, row, col, rules);
  return jumps.length > 0 ? jumps : getSimpleMovesForPiece(board, row, col, rules);
}

/** Total pieces capturable by continuing optimally from this jump. */
function chainCaptureCount(board: Board, move: Move, rules: RuleOptions): number {
  const next = applyMove(board, move);
  const continuation =
    move.captureRow !== null ? getJumpsForPiece(next, move.toRow, move.toCol, rules) : [];
  if (continuation.length === 0) return 1;
  return 1 + Math.max(...continuation.map((m) => chainCaptureCount(next, m, rules)));
}

/** Jumps available to continue a capture chain with the piece that just moved. */
export function getContinuationJumps(
  board: Board,
  row: number,
  col: number,
  rules: RuleOptions = DEFAULT_RULES
): Move[] {
  const jumps = getJumpsForPiece(board, row, col, rules);
  if (jumps.length <= 1 || !rules.maximumCapture) return jumps;
  const counts = jumps.map((m) => chainCaptureCount(board, m, rules));
  const max = Math.max(...counts);
  return jumps.filter((_, i) => counts[i] === max);
}

/** All legal moves for a color. Captures are mandatory when any piece has one. */
export function getAllLegalMoves(
  board: Board,
  color: Color,
  rules: RuleOptions = DEFAULT_RULES
): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        moves.push(...getMovesForPiece(board, row, col, rules));
      }
    }
  }
  const anyJump = moves.some((m) => m.captureRow !== null);
  let legal = anyJump ? moves.filter((m) => m.captureRow !== null) : moves;

  if (anyJump && rules.maximumCapture) {
    const counts = legal.map((m) => chainCaptureCount(board, m, rules));
    const max = Math.max(...counts);
    legal = legal.filter((_, i) => counts[i] === max);
  }

  return legal;
}

export function applyMove(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const piece = next[move.fromRow][move.fromCol];
  if (!piece) return next;
  next[move.fromRow][move.fromCol] = null;
  if (move.captureRow !== null && move.captureCol !== null) {
    next[move.captureRow][move.captureCol] = null;
  }
  const promoted =
    !piece.king &&
    ((piece.color === "red" && move.toRow === 0) ||
      (piece.color === "black" && move.toRow === BOARD_SIZE - 1));
  next[move.toRow][move.toCol] = promoted ? { ...piece, king: true } : piece;
  return next;
}

function hasAnyPieces(board: Board, color: Color): boolean {
  return board.some((row) => row.some((cell) => cell?.color === color));
}

/** The winner, or null if the side to move still has a game ahead of them. */
export function checkWinner(
  board: Board,
  colorToMove: Color,
  rules: RuleOptions = DEFAULT_RULES
): Color | null {
  const other: Color = colorToMove === "red" ? "black" : "red";
  if (!hasAnyPieces(board, colorToMove)) return other;
  if (getAllLegalMoves(board, colorToMove, rules).length === 0) return other;
  return null;
}

function evaluate(board: Board, forColor: Color): number {
  let score = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const base = piece.king ? 3 : 1;
      const advancement = piece.king
        ? 0
        : piece.color === "red"
          ? BOARD_SIZE - 1 - row
          : row;
      const value = base + advancement * 0.05;
      score += piece.color === forColor ? value : -value;
    }
  }
  return score;
}

function minimax(
  board: Board,
  color: Color,
  aiColor: Color,
  depth: number,
  alpha: number,
  beta: number,
  rules: RuleOptions
): number {
  const maximizing = color === aiColor;
  const winner = checkWinner(board, color, rules);
  if (winner) return winner === aiColor ? 500 + depth : -500 - depth;
  if (depth <= 0) return evaluate(board, aiColor);

  const moves = getAllLegalMoves(board, color, rules);
  let value = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const nextBoard = applyMove(board, move);
    const continuation =
      move.captureRow !== null
        ? getContinuationJumps(nextBoard, move.toRow, move.toCol, rules)
        : [];
    const nextColor: Color =
      continuation.length > 0 ? color : color === "red" ? "black" : "red";
    const nextDepth = continuation.length > 0 ? depth : depth - 1;
    const result = minimax(nextBoard, nextColor, aiColor, nextDepth, alpha, beta, rules);

    if (maximizing) {
      value = Math.max(value, result);
      alpha = Math.max(alpha, value);
    } else {
      value = Math.min(value, result);
      beta = Math.min(beta, value);
    }
    if (beta <= alpha) break;
  }

  return value;
}

/**
 * Pick the AI's next single step/jump. Pass `restrictTo` (the piece that just
 * captured) while continuing a forced capture chain — only that piece may move.
 */
export function chooseAiMove(
  board: Board,
  aiColor: Color,
  depth = 4,
  restrictTo?: { row: number; col: number },
  rules: RuleOptions = DEFAULT_RULES
): Move | null {
  const moves = restrictTo
    ? getContinuationJumps(board, restrictTo.row, restrictTo.col, rules)
    : getAllLegalMoves(board, aiColor, rules);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestValue = -Infinity;
  for (const move of moves) {
    const nextBoard = applyMove(board, move);
    const continuation =
      move.captureRow !== null
        ? getContinuationJumps(nextBoard, move.toRow, move.toCol, rules)
        : [];
    const nextColor: Color =
      continuation.length > 0 ? aiColor : aiColor === "red" ? "black" : "red";
    const nextDepth = continuation.length > 0 ? depth : depth - 1;
    const value = minimax(nextBoard, nextColor, aiColor, nextDepth, -Infinity, Infinity, rules);
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  return bestMove;
}
