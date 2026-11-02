export type TypingDifficulty = "easy" | "medium" | "hard";

export const TYPING_PASSAGES: Record<TypingDifficulty, string[]> = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Knutsford students work hard and play harder.",
    "Practice typing every day to get faster.",
    "Good habits build a strong future for everyone.",
    "Campus life is busy but always worth it.",
  ],
  medium: [
    "The Students' Representative Council exists to serve every student on this campus, from orientation week through to graduation day.",
    "Typing quickly and accurately is a skill that pays off in exams, assignments, and every job you will ever apply for.",
    "Knutsford University brings together students from every faculty to learn, compete, and build lasting friendships.",
    "A good typist keeps their eyes on the screen, their fingers on the home row, and their mind on the words ahead.",
  ],
  hard: [
    "In 2026, over 12,000 students registered for SRC elections — a record-breaking turnout that exceeded expectations by nearly 40%!",
    "Dr. Mensah announced that the new library wing, costing GHS 2.4 million, would open by the 3rd quarter of next year.",
    "\"Discipline, excellence, and community\" — these three words, read the SRC president, define everything we stand for.",
    "The tournament bracket (16 players, single-elimination) will be finalized by 6:00 PM on Friday, no exceptions allowed.",
  ],
};

export function randomPassage(difficulty: TypingDifficulty): string {
  const pool = TYPING_PASSAGES[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}
