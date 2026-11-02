import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentStudent } from "@/db/queries";
import { getStudentBestScore } from "@/db/gameQueries";
import { TypingSpeedGame } from "@/components/games/TypingSpeedGame";

export const dynamic = "force-dynamic";

export default async function TypingSpeedPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const personalBest = await getStudentBestScore(student.id, "typing");

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
        Typing Speed
      </h1>
      <TypingSpeedGame personalBest={personalBest} />
    </div>
  );
}
