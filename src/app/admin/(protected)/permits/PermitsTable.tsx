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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/admin/Pagination";
import { formatCurrency, getPermitStatus, permitStatusBadge } from "@/lib/permits";
import { PermitDialog } from "./PermitDialog";

type PermitRow = {
  id: string;
  referenceNumber: string;
  amount: string | null;
  paymentMethod: string | null;
  cardStatus: string;
  expiresAt: string | null;
  student: { firstName: string; lastName: string; indexNumber: string } | null;
  issuer: { name: string } | null;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
];

export function PermitsTable({
  permits,
  canCreate,
  initialQuery,
  initialStatus,
  page,
  totalPages,
  total,
}: {
  permits: PermitRow[];
  canCreate: boolean;
  initialQuery: string;
  initialStatus: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function openPermit(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function navigate(nextQuery: string, nextStatus: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextStatus !== "all") params.set("status", nextStatus);
    router.push(`/admin/permits?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(query, initialStatus);
  }

  function handleStatusChange(value: string | null) {
    navigate(query, value ?? "all");
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

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="max-w-md flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, student name or index number…"
          />
        </form>
        <Select value={initialStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Student</TableHead>
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
                <TableCell colSpan={7} className="py-10 text-center text-neutral-400">
                  No permits found.
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
                  <TableCell className="text-neutral-500">{p.paymentMethod ?? "—"}</TableCell>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        basePath="/admin/permits"
        searchParams={{ q: initialQuery || undefined, status: initialStatus !== "all" ? initialStatus : undefined }}
      />

      <PermitDialog
        permitId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
