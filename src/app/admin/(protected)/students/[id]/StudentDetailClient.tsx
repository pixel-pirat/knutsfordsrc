"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { DigitalIdCard } from "@/components/DigitalIdCard";
import { formatCurrency, getPermitStatus, permitStatusBadge } from "@/lib/permits";
import { StudentDialog } from "../StudentDialog";
import { PermitDialog } from "../../permits/PermitDialog";

type StudentDetail = {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  level: string | null;
  studyMode: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

type PermitRow = {
  id: string;
  referenceNumber: string;
  amount: string | null;
  paymentMethod: string | null;
  cardStatus: string;
  expiresAt: string | null;
  issuer: { id: string; name: string } | null;
};

export function StudentDetailClient({
  student,
  permits,
  qrDataUrl,
  canEdit,
}: {
  student: StudentDetail;
  permits: PermitRow[];
  qrDataUrl: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [permitDialogOpen, setPermitDialogOpen] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<{
    temporaryPassword: string;
    emailSent: boolean;
  } | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openPermit(id: string) {
    setSelectedPermitId(id);
    setPermitDialogOpen(true);
  }

  async function handleDeleteStudent() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "Failed to delete student");
        setConfirmingDelete(false);
        return;
      }
      router.push("/admin/students");
      router.refresh();
    } catch {
      setDeleteError("Failed to delete student");
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleResendWelcome() {
    setResending(true);
    setResendError(null);
    setResendResult(null);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/resend-welcome`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setResendError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResendResult({ temporaryPassword: data.temporaryPassword, emailSent: data.emailSent });
    } catch {
      setResendError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/students"
        className="text-sm text-neutral-500 dark:text-neutral-400 transition-colors hover:text-ink"
      >
        ← Back to students
      </Link>

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={`${student.firstName} ${student.lastName}`}
            avatarUrl={student.avatarUrl}
            size="lg"
            className="h-14 w-14"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{student.indexNumber}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleResendWelcome} disabled={resending}>
              {resending ? "Sending…" : "Resend Welcome Email"}
            </Button>
            <Button onClick={() => setEditOpen(true)}>Edit Student</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : confirmingDelete ? "Confirm Delete?" : "Delete Student"}
            </Button>
          </div>
        )}
      </div>

      {resendError && (
        <p className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">{resendError}</p>
      )}
      {deleteError && (
        <p className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
      )}
      {confirmingDelete && !deleting && (
        <p className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          This permanently deletes {student.firstName} {student.lastName} and all {permits.length}{" "}
          permit{permits.length === 1 ? "" : "s"} issued to them. Click &ldquo;Confirm Delete?&rdquo; again to proceed, or navigate away to cancel.
        </p>
      )}
      {resendResult && (
        <div className="mb-6 rounded-xl bg-gold/15 p-4 ring-1 ring-gold/30">
          <p className="text-sm font-semibold text-ink dark:text-neutral-100">New temporary password issued</p>
          <p className="mt-2 rounded-md bg-white dark:bg-neutral-900 px-3 py-2 text-center font-mono text-sm font-semibold text-ink dark:text-neutral-100 ring-1 ring-black/10 dark:ring-white/10">
            {resendResult.temporaryPassword}
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {resendResult.emailSent
              ? "This has also been emailed to the student, along with the login link."
              : "Email not sent (no email on file, or email isn't configured yet) — share this password with the student directly. Their previous password no longer works."}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10 sm:p-8">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">Profile</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">Email</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{student.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">Phone</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{student.phone ?? "—"}</dd>
              </div>
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
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">Study Mode</dt>
                <dd className="capitalize text-neutral-700 dark:text-neutral-300">{student.studyMode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">Registered</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">
                  {new Date(student.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
            <div className="border-b border-black/5 dark:border-white/10 px-6 py-4">
              <h2 className="text-sm font-bold text-ink dark:text-neutral-100">Permits</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                      No permits issued to this student yet.
                    </TableCell>
                  </TableRow>
                )}
                {permits.map((p) => {
                  const status = getPermitStatus(p);
                  return (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => openPermit(p.id)}
                    >
                      <TableCell className="font-medium text-ink dark:text-neutral-100">{p.referenceNumber}</TableCell>
                      <TableCell className="text-neutral-700 dark:text-neutral-300">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-neutral-500 dark:text-neutral-400">{p.paymentMethod ?? "—"}</TableCell>
                      <TableCell className="text-neutral-700 dark:text-neutral-300">{p.issuer?.name ?? "—"}</TableCell>
                      <TableCell className="text-neutral-500 dark:text-neutral-400">
                        {p.expiresAt
                          ? new Date(p.expiresAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${permitStatusBadge[status]}`}>
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <DigitalIdCard
            name={`${student.firstName} ${student.lastName}`}
            indexNumber={student.indexNumber}
            program={student.program}
            level={student.level}
            avatarUrl={student.avatarUrl}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>

      <StudentDialog
        studentId={student.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => router.refresh()}
      />
      <PermitDialog
        permitId={selectedPermitId}
        open={permitDialogOpen}
        onOpenChange={setPermitDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
