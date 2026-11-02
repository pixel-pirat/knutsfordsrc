import type { GameKey } from "@/db/gameQueries";

/** Best-effort score submission — never blocks or interrupts gameplay. */
export async function submitScore(game: GameKey, score: number) {
  try {
    await fetch("/api/games/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, score }),
    });
  } catch {
    // ignore — scores are a nice-to-have
  }
}
