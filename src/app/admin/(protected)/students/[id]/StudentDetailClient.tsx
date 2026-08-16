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

  function openPermit(id: string) {
    setSelectedPermitId(id);
    setPermitDialogOpen(true);
  }

  return (
    <div>
      <Link
        href="/admin/students"
        className="text-sm text-neutral-500 transition-colors hover:text-ink"
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
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-neutral-500">{student.indexNumber}</p>
          </div>
        </div>
        {canEdit && <Button onClick={() => setEditOpen(true)}>Edit Student</Button>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-8">
            <h2 className="text-sm font-bold text-ink">Profile</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-neutral-400">Email</dt>
                <dd className="text-neutral-700">{student.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400">Phone</dt>
                <dd className="text-neutral-700">{student.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400">Programme</dt>
                <dd className="text-neutral-700">{student.program ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400">Level</dt>
                <dd className="text-neutral-700">
                  {student.level ? `Level ${student.level}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400">Study Mode</dt>
                <dd className="capitalize text-neutral-700">{student.studyMode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400">Registered</dt>
                <dd className="text-neutral-700">
                  {new Date(student.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-black/5">
            <div className="border-b border-black/5 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Permits</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-neutral-400">
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
                      <TableCell className="font-medium text-ink">{p.referenceNumber}</TableCell>
                      <TableCell className="text-neutral-700">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-neutral-700">{p.issuer?.name ?? "—"}</TableCell>
                      <TableCell className="text-neutral-500">
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
