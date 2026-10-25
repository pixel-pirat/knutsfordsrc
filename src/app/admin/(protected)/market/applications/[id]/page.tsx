import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  getApplicationDetail,
  listApplicationEvents,
} from "@/db/marketplaceQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  AVAILABILITY_LABELS,
  CATEGORY_LABELS,
  FULFILMENT_LABELS,
  formatMarketplaceDateTime,
} from "@/lib/marketplace";
import { ApplicationDecisionPanel } from "./ApplicationDecisionPanel";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const detail = await getApplicationDetail(id);
  if (!detail) notFound();

  const { application, student } = detail;
  const events = await listApplicationEvents(application.id);

  return (
    <div>
      <Link
        href="/admin/market/applications"
        className="text-sm font-medium text-gold-dark hover:underline dark:text-gold-light"
      >
        ← Store Applications
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {application.storeName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Applied {formatMarketplaceDateTime(application.submittedAt)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-sm ${APPLICATION_STATUS_STYLES[application.status]}`}
        >
          {APPLICATION_STATUS_LABELS[application.status] ?? application.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Business details
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Category">
                {CATEGORY_LABELS[application.category] ?? application.category}
              </Detail>
              <Detail label="Availability">
                {AVAILABILITY_LABELS[application.availability] ??
                  application.availability}
              </Detail>
              <Detail label="Contact number">{application.contactNumber}</Detail>
              <Detail label="Fulfilment">
                {application.fulfilmentMethods
                  .map((method) => FULFILMENT_LABELS[method] ?? method)
                  .join(", ") || "—"}
              </Detail>
            </dl>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Business description
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                  {application.description}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Products / services offered
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                  {application.offerings}
                </p>
              </div>
              {application.evidenceNotes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Supporting notes
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                    {application.evidenceNotes}
                  </p>
                </div>
              )}
              {application.evidenceUrl && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Supporting evidence
                  </p>
                  <div className="relative mt-2 h-48 w-full overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
                    <Image
                      src={application.evidenceUrl}
                      alt="Supporting evidence"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Declaration accepted:{" "}
                {application.declarationAccepted ? "Yes" : "No"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Application history
            </h2>
            <ol className="mt-4 space-y-4">
              {events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                      {APPLICATION_STATUS_LABELS[event.status] ?? event.status}
                      <span className="ml-2 text-xs font-normal text-neutral-400 dark:text-neutral-500">
                        {formatMarketplaceDateTime(event.createdAt)}
                      </span>
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {event.actorName}
                    </p>
                    {event.note && (
                      <p className="mt-1 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                        {event.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
              {events.length === 0 && (
                <li className="text-sm text-neutral-400 dark:text-neutral-500">
                  No history recorded yet.
                </li>
              )}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Student
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <UserAvatar
                name={`${student.firstName} ${student.lastName}`}
                avatarUrl={student.avatarUrl}
                size="default"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                  {student.firstName} {student.lastName}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {student.indexNumber}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Detail label="Email">{student.email ?? "—"}</Detail>
              <Detail label="Phone">{student.phone ?? "—"}</Detail>
              <Detail label="Programme">{student.program ?? "—"}</Detail>
              <Detail label="Level">
                {student.level ? `Level ${student.level}` : "—"}
              </Detail>
            </dl>
            <Link
              href={`/admin/students/${student.id}`}
              className="mt-4 inline-block text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
            >
              View student record
            </Link>
          </section>

          <ApplicationDecisionPanel
            applicationId={application.id}
            status={application.status}
            existingReason={application.decisionReason}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
        {children}
      </dd>
    </div>
  );
}
