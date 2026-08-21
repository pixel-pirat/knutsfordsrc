import type { Metadata } from "next";
import Image from "next/image";
import { getStudentPublicSnapshot } from "@/db/queries";
import { getPermitStatus, permitStatusBadge } from "@/lib/permits";
import { dues } from "@/data/dashboard";
import { UserAvatar } from "@/components/UserAvatar";

export const metadata: Metadata = {
  title: "Student ID Verification | Knutsford University",
  robots: { index: false, follow: false },
};

export default async function VerifyStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentPublicSnapshot(id).catch(() => null);

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-neutral-950 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-8 text-center shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-base font-semibold text-ink dark:text-neutral-100">ID Not Found</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            This student ID could not be verified.
          </p>
        </div>
      </div>
    );
  }

  const latestPermit = student.permits[0];
  const status = latestPermit ? getPermitStatus(latestPermit) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-neutral-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Knutsford University crest"
            width={440}
            height={398}
            className="h-12 w-auto"
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-gold-dark dark:text-gold-light">KNUTSFORD</span>{" "}
            <span className="text-ink dark:text-neutral-100">UNIVERSITY</span>
          </span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-7">
          <p className="text-center text-xs font-bold tracking-wide text-gold-dark dark:text-gold-light">
            VERIFIED STUDENT IDENTITY
          </p>

          <div className="mt-5 flex flex-col items-center text-center">
            <UserAvatar
              name={`${student.firstName} ${student.lastName}`}
              avatarUrl={student.avatarUrl}
              size="lg"
              className="h-20 w-20"
            />
            <p className="mt-3 text-lg font-extrabold text-ink dark:text-neutral-100">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{student.indexNumber}</p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-4 text-sm">
            <div>
              <dt className="text-xs text-neutral-400 dark:text-neutral-500">Programme</dt>
              <dd className="text-neutral-700 dark:text-neutral-300">{student.program ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-400 dark:text-neutral-500">Level</dt>
              <dd className="text-neutral-700 dark:text-neutral-300">
                {student.level ? `Level ${student.level}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-400 dark:text-neutral-500">Permit Status</dt>
              <dd>
                {status ? (
                  <span
                    className={`mt-0.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${permitStatusBadge[status]}`}
                  >
                    {status}
                  </span>
                ) : (
                  <span className="text-neutral-500 dark:text-neutral-400">No permit issued</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-400 dark:text-neutral-500">Dues Balance</dt>
              <dd className="font-semibold text-ink dark:text-neutral-100">{dues.balance}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-neutral-400 dark:text-neutral-500">Outstanding</dt>
              <dd className="text-neutral-700 dark:text-neutral-300">
                {dues.balance === "GHS 0.00" ? "None" : `${dues.balance} (${dues.term})`}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-5 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Scanned via Knutsford SRC Digital ID
        </p>
      </div>
    </div>
  );
}
