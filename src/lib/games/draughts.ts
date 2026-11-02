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

export const BOARD_SIZE = 8;

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

function directionsFor(piece: Piece): [number, number][] {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }
  const dr = piece.color === "red" ? -1 : 1;
  return [
    [dr, -1],
    [dr, 1],
  ];
}

/** Legal moves for a single piece — jumps only if any are available for it. */
export function getMovesForPiece(board: Board, row: number, col: number): Move[] {
  const piece = board[row][col];
  if (!piece) return [];
  const dirs = directionsFor(piece);
  const jumps: Move[] = [];
  const steps: Move[] = [];

  for (const [dr, dc] of dirs) {
    const stepR = row + dr;
    const stepC = col + dc;
    if (inBounds(stepR, stepC) && !board[stepR][stepC]) {
      steps.push({
        fromRow: row,
        fromCol: col,
        toRow: stepR,
        toCol: stepC,
        captureRow: null,
        captureCol: null,
      });
    }

    const jumpR = row + dr * 2;
    const jumpC = col + dc * 2;
    const midR = row + dr;
    const midC = col + dc;
    if (
      inBounds(jumpR, jumpC) &&
      !board[jumpR][jumpC] &&
      inBounds(midR, midC) &&
      board[midR][midC] &&
      board[midR][midC]!.color !== piece.color
    ) {
      jumps.push({
        fromRow: row,
        fromCol: col,
        toRow: jumpR,
        toCol: jumpC,
        captureRow: midR,
        captureCol: midC,
      });
    }
  }

  return jumps.length > 0 ? jumps : steps;
}

/** All legal moves for a color. Captures are mandatory when any piece has one. */
export function getAllLegalMoves(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        moves.push(...getMovesForPiece(board, row, col));
      }
    }
  }
  const anyJump = moves.some((m) => m.captureRow !== null);
  return anyJump ? moves.filter((m) => m.captureRow !== null) : moves;
}

/** Jumps available to continue a capture chain with the piece that just moved. */
export function getContinuationJumps(board: Board, row: number, col: number): Move[] {
  return getMovesForPiece(board, row, col).filter((m) => m.captureRow !== null);
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
export function checkWinner(board: Board, colorToMove: Color): Color | null {
  const other: Color = colorToMove === "red" ? "black" : "red";
  if (!hasAnyPieces(board, colorToMove)) return other;
  if (getAllLegalMoves(board, colorToMove).length === 0) return other;
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
  beta: number
): number {
  const maximizing = color === aiColor;
  const winner = checkWinner(board, color);
  if (winner) return winner === aiColor ? 500 + depth : -500 - depth;
  if (depth <= 0) return evaluate(board, aiColor);

  const moves = getAllLegalMoves(board, color);
  let value = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const nextBoard = applyMove(board, move);
    const continuation =
      move.captureRow !== null
        ? getContinuationJumps(nextBoard, move.toRow, move.toCol)
        : [];
    const nextColor: Color =
      continuation.length > 0 ? color : color === "red" ? "black" : "red";
    const nextDepth = continuation.length > 0 ? depth : depth - 1;
    const result = minimax(nextBoard, nextColor, aiColor, nextDepth, alpha, beta);

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
  restrictTo?: { row: number; col: number }
): Move | null {
  const moves = restrictTo
    ? getContinuationJumps(board, restrictTo.row, restrictTo.col)
    : getAllLegalMoves(board, aiColor);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestValue = -Infinity;
  for (const move of moves) {
    const nextBoard = applyMove(board, move);
    const continuation =
      move.captureRow !== null
        ? getContinuationJumps(nextBoard, move.toRow, move.toCol)
        : [];
    const nextColor: Color =
      continuation.length > 0 ? aiColor : aiColor === "red" ? "black" : "red";
    const nextDepth = continuation.length > 0 ? depth : depth - 1;
    const value = minimax(nextBoard, nextColor, aiColor, nextDepth, -Infinity, Infinity);
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  return bestMove;
}
