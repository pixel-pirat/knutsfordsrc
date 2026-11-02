import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentStudent } from "@/db/queries";
import { getStudentBestScore } from "@/db/gameQueries";
import { PianoTilesGame } from "@/components/games/PianoTilesGame";

export const dynamic = "force-dynamic";

export default async function PianoTilesPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const personalBest = await getStudentBestScore(student.id, "piano");

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
        Piano Tiles
      </h1>
      <PianoTilesGame personalBest={personalBest} />
    </div>
  );
}
