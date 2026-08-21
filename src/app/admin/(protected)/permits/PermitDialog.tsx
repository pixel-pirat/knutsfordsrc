"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, getPermitStatus, permitStatusBadge } from "@/lib/permits";

const PAYMENT_METHODS = ["Cash", "MoMo", "Bank Payment", "Free Card"] as const;

type StudentResult = {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  level: string | null;
};

type PermitDetail = {
  id: string;
  referenceNumber: string;
  amount: string | null;
  paymentMethod: string | null;
  cardStatus: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  emailSentAt: string | null;
  issuer: { id: string; name: string } | null;
  student: {
    id: string;
    indexNumber: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
};

export function PermitDialog({
  permitId,
  open,
  onOpenChange,
  onSuccess,
}: {
  permitId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = permitId ? "view" : "create";

  // --- create mode state ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<StudentResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [expiryDays, setExpiryDays] = useState<number | null>(null);
  const [expiryPreview, setExpiryPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{
    referenceNumber: string;
    amount: string;
    expiresAt: string;
    studentName: string;
    emailSent: boolean;
  } | null>(null);

  // --- view mode state ---
  const [detail, setDetail] = useState<PermitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Reset transient UI state when the dialog opens for a (possibly new) permit,
  // following React's "adjust state during render" pattern rather than an effect.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (permitId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      setActionError(null);
      setActionMessage(null);
      if (permitId) {
        setLoading(true);
      } else {
        setQuery("");
        setResults([]);
        setSelected(null);
        setAmount("");
        setPaymentMethod("");
        setCreated(null);
        setDetail(null);
      }
    }
  }

  useEffect(() => {
    if (!open || !permitId) return;
    fetch(`/api/admin/permits/${permitId}`)
      .then((res) => res.json())
      .then((data) => setDetail(data.permit))
      .finally(() => setLoading(false));
  }, [open, permitId]);

  useEffect(() => {
    if (!open || permitId) return;
    fetch("/api/admin/settings/permit-expiry")
      .then((res) => res.json())
      .then((data) => {
        const days = typeof data.days === "number" ? data.days : null;
        setExpiryDays(days);
        setExpiryPreview(
          days
            ? new Date(Date.now() + days * 86400000).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null
        );
      })
      .catch(() => {
        setExpiryDays(null);
        setExpiryPreview(null);
      });
  }, [open, permitId]);

  useEffect(() => {
    if (selected || query.trim().length < 2) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/students/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.students ?? []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function close() {
    onOpenChange(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!selected) {
      setFormError("Search for and select a student first.");
      return;
    }
    const amountNumber = Number(amount);
    if (!amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
      setFieldErrors({ amount: "Enter the amount paid" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selected.id,
          amount: amountNumber,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setCreated({
        referenceNumber: data.permit.referenceNumber,
        amount: data.permit.amount,
        expiresAt: data.permit.expiresAt,
        studentName: `${data.student.firstName} ${data.student.lastName}`,
        emailSent: data.emailSent,
      });
      onSuccess?.();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetCreateForm() {
    setSelected(null);
    setQuery("");
    setAmount("");
    setPaymentMethod("");
    setCreated(null);
    setFormError(null);
  }

  async function handleResend() {
    if (!detail) return;
    setResending(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/permits/${detail.id}/resend`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Failed to resend email");
        return;
      }
      setDetail((d) => (d ? { ...d, emailSentAt: data.emailSentAt } : d));
      setActionMessage("Receipt email sent.");
    } catch {
      setActionError("Failed to resend email");
    } finally {
      setResending(false);
    }
  }

  async function toggleCardStatus() {
    if (!detail) return;
    const next = detail.cardStatus === "active" ? "pending" : "active";
    setTogglingStatus(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/permits/${detail.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardStatus: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Failed to update status");
        return;
      }
      setDetail((d) => (d ? { ...d, cardStatus: data.permit.cardStatus, status: data.permit.cardStatus } : d));
      onSuccess?.();
    } catch {
      setActionError("Failed to update status");
    } finally {
      setTogglingStatus(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {mode === "create" && !created && (
          <>
            <DialogHeader>
              <DialogTitle>Create New Permit</DialogTitle>
              <DialogDescription>
                Search for a student, confirm their details, then record the payment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div ref={containerRef} className="relative">
                <Label htmlFor="permitStudentSearch">Student</Label>
                {selected ? (
                  <div className="mt-1.5 rounded-xl bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">
                          {selected.firstName} {selected.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">{selected.indexNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(null);
                          setQuery("");
                        }}
                        className="shrink-0 text-xs font-semibold text-gold-dark hover:underline"
                      >
                        change
                      </button>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <div>
                        <dt className="text-neutral-400">Email</dt>
                        <dd className="text-neutral-700">{selected.email ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-neutral-400">Phone</dt>
                        <dd className="text-neutral-700">{selected.phone ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-neutral-400">Programme</dt>
                        <dd className="text-neutral-700">{selected.program ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-neutral-400">Level</dt>
                        <dd className="text-neutral-700">
                          {selected.level ? `Level ${selected.level}` : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <>
                    <Input
                      id="permitStudentSearch"
                      autoComplete="off"
                      className="mt-1.5"
                      placeholder="Search by index number or name…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowResults(true)}
                    />
                    {showResults && query.trim().length >= 2 && (
                      <div className="absolute z-10 mt-1.5 w-full rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/10">
                        {searching && (
                          <p className="px-3 py-2 text-sm text-neutral-400">Searching…</p>
                        )}
                        {!searching && results.length === 0 && (
                          <p className="px-3 py-2 text-sm text-neutral-400">
                            No students found.{" "}
                            <Link href="/admin/students" className="text-gold-dark hover:underline">
                              Create one first
                            </Link>
                          </p>
                        )}
                        {!searching &&
                          results.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelected(s);
                                setQuery("");
                                setResults([]);
                                setShowResults(false);
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-black/5"
                            >
                              <span className="font-medium text-ink">
                                {s.firstName} {s.lastName}
                              </span>
                              <span className="text-xs text-neutral-400">{s.indexNumber}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="permitAmount">Amount Paid (GHS)</Label>
                  <Input
                    id="permitAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1.5"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {fieldErrors.amount && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>
                  )}
                </div>
                <div>
                  <Label>Expires</Label>
                  <p className="mt-1.5 flex h-8 items-center text-sm text-neutral-600">
                    {expiryPreview ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Set by the super admin ({expiryDays ?? "…"} days from today)
                  </p>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "")}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Permit"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {mode === "create" && created && (
          <>
            <DialogHeader>
              <DialogTitle>Permit Created</DialogTitle>
            </DialogHeader>
            <div className="text-center">
              <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {created.referenceNumber}
              </span>
              <p className="mt-3 text-sm text-neutral-500">
                {formatCurrency(created.amount)} &middot; {created.studentName}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Expires{" "}
                {new Date(created.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="mt-3 text-xs text-neutral-400">
                {created.emailSent
                  ? "Receipt emailed to the student."
                  : "Receipt email not sent (student has no email on file, or email isn't configured yet)."}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetCreateForm}>
                Create Another
              </Button>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        )}

        {mode === "view" && (
          <>
            <DialogHeader>
              <DialogTitle>Permit Details</DialogTitle>
            </DialogHeader>
            {loading || !detail ? (
              <p className="py-8 text-center text-sm text-neutral-400">Loading…</p>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-ink">{detail.referenceNumber}</p>
                    <p className="text-sm text-neutral-500">
                      {detail.student.firstName} {detail.student.lastName} &middot;{" "}
                      {detail.student.indexNumber}
                    </p>
                  </div>
                  <Badge variant="outline" className={`capitalize ${permitStatusBadge[getPermitStatus(detail)]}`}>
                    {getPermitStatus(detail)}
                  </Badge>
                </div>

                <dl className="grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 p-4 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-400">Amount Paid</dt>
                    <dd className="font-semibold text-ink">{formatCurrency(detail.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Payment Method</dt>
                    <dd className="text-neutral-700">{detail.paymentMethod ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Issued By</dt>
                    <dd className="text-neutral-700">{detail.issuer?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Date Paid</dt>
                    <dd className="text-neutral-700">
                      {new Date(detail.issuedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Expires</dt>
                    <dd className="text-neutral-700">
                      {detail.expiresAt
                        ? new Date(detail.expiresAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-neutral-400">Receipt Email</dt>
                    <dd className="text-neutral-700">
                      {detail.emailSentAt
                        ? `Sent ${new Date(detail.emailSentAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Not sent yet"}
                      {" · "}
                      {detail.student.email ?? "no email on file"}
                    </dd>
                  </div>
                </dl>

                {actionError && (
                  <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                    {actionError}
                  </p>
                )}
                {actionMessage && (
                  <p className="rounded-md bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
                    {actionMessage}
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Close
              </Button>
              {detail && getPermitStatus(detail) !== "expired" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={toggleCardStatus}
                  disabled={togglingStatus}
                >
                  {togglingStatus
                    ? "Updating…"
                    : detail.cardStatus === "active"
                      ? "Mark as Pending"
                      : "Mark as Given"}
                </Button>
              )}
              <Button type="button" onClick={handleResend} disabled={resending || !detail}>
                {resending ? "Sending…" : "Resend Email"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
