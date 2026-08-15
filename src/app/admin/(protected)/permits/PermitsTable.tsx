"use client";

import { useState } from "react";
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
import { formatCurrency, getPermitStatus, permitStatusBadge } from "@/lib/permits";
import { PermitDialog } from "./PermitDialog";

type PermitRow = {
  id: string;
  referenceNumber: string;
  amount: string | null;
  cardStatus: string;
  expiresAt: string | null;
  student: { firstName: string; lastName: string; indexNumber: string } | null;
  issuer: { name: string } | null;
};

export function PermitsTable({
  permits,
  canCreate,
}: {
  permits: PermitRow[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function openPermit(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Permits</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All permits issued through the Digital Hub
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => openPermit(null)}>Create New Permit</Button>
        )}
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issued By</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-neutral-400">
                  No permits issued yet.
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
                  <TableCell className="text-neutral-700">
                    {p.student?.firstName} {p.student?.lastName}
                    <span className="ml-1.5 text-xs text-neutral-400">
                      {p.student?.indexNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-700">{formatCurrency(p.amount)}</TableCell>
                  <TableCell className="text-neutral-700">{p.issuer?.name}</TableCell>
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

      <PermitDialog
        permitId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
