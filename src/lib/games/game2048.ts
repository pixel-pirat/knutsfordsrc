export type Grid = number[][];
export type Direction = "up" | "down" | "left" | "right";
export type Difficulty = "easy" | "medium" | "hard";

export const GRID_SIZE_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  medium: 4,
  hard: 3,
};

export function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function emptyCells(grid: Grid) {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 0) cells.push({ row, col });
    }
  }
  return cells;
}

export function spawnRandomTile(grid: Grid): Grid {
  const empty = emptyCells(grid);
  if (empty.length === 0) return grid;
  const { row, col } = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((r) => [...r]);
  next[row][col] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export function createInitialGrid(size: number): Grid {
  let grid = createEmptyGrid(size);
  grid = spawnRandomTile(grid);
  grid = spawnRandomTile(grid);
  return grid;
}

/** Slide + merge a single row to the left; returns the new row and the score gained. */
function collapseRowLeft(row: number[]): { row: number[]; gained: number } {
  const size = row.length;
  const values = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  let i = 0;
  while (i < values.length) {
    if (values[i] === values[i + 1]) {
      const sum = values[i] * 2;
      merged.push(sum);
      gained += sum;
      i += 2;
    } else {
      merged.push(values[i]);
      i += 1;
    }
  }
  while (merged.length < size) merged.push(0);
  return { row: merged, gained };
}

function transpose(grid: Grid): Grid {
  return grid[0].map((_, col) => grid.map((row) => row[col]));
}

export function move(grid: Grid, direction: Direction): { grid: Grid; gained: number; moved: boolean } {
  let working = grid.map((r) => [...r]);
  let gained = 0;

  if (direction === "up" || direction === "down") {
    working = transpose(working);
  }
  if (direction === "right" || direction === "down") {
    working = working.map((r) => [...r].reverse());
  }

  const result = working.map((r) => {
    const { row, gained: rowGained } = collapseRowLeft(r);
    gained += rowGained;
    return row;
  });

  let finalGrid = result;
  if (direction === "right" || direction === "down") {
    finalGrid = finalGrid.map((r) => [...r].reverse());
  }
  if (direction === "up" || direction === "down") {
    finalGrid = transpose(finalGrid);
  }

  const moved = JSON.stringify(finalGrid) !== JSON.stringify(grid);
  return { grid: finalGrid, gained, moved };
}

export function hasMovesLeft(grid: Grid): boolean {
  if (emptyCells(grid).length > 0) return true;
  for (const direction of ["up", "down", "left", "right"] as const) {
    if (move(grid, direction).moved) return true;
  }
  return false;
}

export function hasReached2048(grid: Grid): boolean {
  return grid.some((row) => row.some((v) => v >= 2048));
}
