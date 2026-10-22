import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import { getHallById, listStudentsInHall } from "@/db/hallQueries";
import { db } from "@/db";
import { hallEvents } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";

export default async function AdminHallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_halls")) {
    return <AccessRestricted />;
  }

  const { id } = await params;
  const hall = await getHallById(id);
  if (!hall) {
    return (
      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-10 text-center ring-1 ring-black/5 dark:ring-white/10">
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Hall not found.</p>
        <Button
          render={<Link href="/admin/halls" />}
          variant="outline"
          className="mt-4"
        >
          Back to Halls
        </Button>
      </div>
    );
  }

  const [studentList, upcomingCount] = await Promise.all([
    listStudentsInHall(id),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(hallEvents)
      .where(and(eq(hallEvents.hallId, id), eq(hallEvents.published, true))),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/halls"
          className="text-sm font-medium text-gold-dark dark:text-gold-light hover:underline"
        >
          ← Halls
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
              {hall.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {hall.description ?? "Hall profile"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Members
          </p>
          <p className="mt-1 text-3xl font-extrabold text-ink dark:text-neutral-100">
            {studentList.length}
            {hall.capacity ? (
              <span className="text-base font-semibold text-neutral-400"> / {hall.capacity}</span>
            ) : null}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Published Events
          </p>
          <p className="mt-1 text-3xl font-extrabold text-ink dark:text-neutral-100">
            {upcomingCount[0]?.count ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Warden
          </p>
          <p className="mt-1 text-base font-bold text-ink dark:text-neutral-100">
            {hall.wardenName ?? "—"}
          </p>
          {hall.contactEmail && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {hall.contactEmail}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <div className="border-b border-black/5 px-5 py-4 dark:border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Students in this hall
          </h2>
        </div>
        {studentList.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No students assigned to this hall yet. Assign one via
            Students → edit a student.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {studentList.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <UserAvatar
                  name={`${s.firstName} ${s.lastName}`}
                  avatarUrl={s.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {s.indexNumber}
                    {s.program ? ` · ${s.program}` : ""}
                    {s.level ? ` · Level ${s.level}` : ""}
                  </p>
                </div>
                <Link
                  href={`/admin/students/${s.id}`}
                  className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
