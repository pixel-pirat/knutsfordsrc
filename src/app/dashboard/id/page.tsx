import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { getCurrentStudent, getStudentPublicSnapshot } from "@/db/queries";
import { DigitalIdCard } from "@/components/DigitalIdCard";
import { getPermitStatus, permitStatusBadge } from "@/lib/permits";
import { dues } from "@/data/dashboard";
import { getAppUrl } from "@/lib/url";

export default async function StudentIdPage() {
  const currentStudent = await getCurrentStudent();
  if (!currentStudent) redirect("/login");

  const student = await getStudentPublicSnapshot(currentStudent.id);
  if (!student) redirect("/login");

  const qrDataUrl = await QRCode.toDataURL(`${getAppUrl()}/verify/${student.id}`, {
    margin: 1,
    width: 240,
  });

  const latestPermit = student.permits[0];
  const status = latestPermit ? getPermitStatus(latestPermit) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">Digital ID</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Your official Knutsford University digital identification card
        </p>
      </div>

      <div className="max-w-xl">
        <DigitalIdCard
          name={`${student.firstName} ${student.lastName}`}
          indexNumber={student.indexNumber}
          program={student.program}
          level={student.level}
          avatarUrl={student.avatarUrl}
          qrDataUrl={qrDataUrl}
        />

        <div className="mt-6 rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold text-ink dark:text-neutral-100">Card Details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-neutral-400 dark:text-neutral-500">Permit Status</dt>
              <dd className="mt-1">
                {status ? (
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${permitStatusBadge[status]}`}
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
              <dd className="mt-1 font-semibold text-ink dark:text-neutral-100">{dues.balance}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-neutral-400 dark:text-neutral-500">
            Scan the QR code on your card to let anyone verify your identity and
            status instantly — no login required.
          </p>
        </div>
      </div>
    </div>
  );
}
