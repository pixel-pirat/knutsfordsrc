import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import { recordGameScore } from "@/db/gameQueries";
import { gameScoreSubmissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = gameScoreSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const [saved] = await recordGameScore(
    student.id,
    parsed.data.game,
    parsed.data.score
  );

  return NextResponse.json({ score: saved });
}
