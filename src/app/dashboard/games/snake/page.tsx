import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentStudent } from "@/db/queries";
import { getStudentBestScore } from "@/db/gameQueries";
import { SnakeGame } from "@/components/games/SnakeGame";

export const dynamic = "force-dynamic";

export default async function SnakePage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const personalBest = await getStudentBestScore(student.id, "snake");

  return (
    <div>
      <Link
        href="/dashboard/games"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Games
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
        Snake
      </h1>
      <SnakeGame personalBest={personalBest} />
    </div>
  );
}
