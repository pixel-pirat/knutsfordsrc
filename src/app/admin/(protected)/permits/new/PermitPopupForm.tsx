"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FormField, inputClass } from "@/components/FormField";
import { formatCurrency } from "@/lib/permits";

type StudentResult = {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  level: string | null;
  studyMode: string | null;
};

export function PermitPopupForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<StudentResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    referenceNumber: string;
    amount: string;
    expiresAt: string;
    studentName: string;
  } | null>(null);

  useEffect(() => {
    if (selected || query.trim().length < 2) {
      return;
    }
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

  function selectStudent(student: StudentResult) {
    setSelected(student);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  function changeStudent() {
    setSelected(null);
    setQuery("");
  }

  function resetForm() {
    setSelected(null);
    setQuery("");
    setAmount("");
    setExpiresAt("");
    setNotes("");
    setResult(null);
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: FormEvent) {
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
    if (!expiresAt) {
      setFieldErrors({ expiresAt: "Expiry date is required" });
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
          expiresAt,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult({
        referenceNumber: data.permit.referenceNumber,
        amount: data.permit.amount,
        expiresAt: data.permit.expiresAt,
        studentName: `${data.student.firstName} ${data.student.lastName}`,
      });
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="text-center">
        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          PERMIT ISSUED
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-ink">
          {result.referenceNumber}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          {formatCurrency(result.amount)} &middot; {result.studentName}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Expires{" "}
          {new Date(result.expiresAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Issue Another Permit
          </button>
          <Link
            href="/admin/permits"
            className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-black/5"
          >
            View All Permits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div ref={containerRef} className="relative">
        <FormField label="Student" htmlFor="studentSearch">
          {selected ? (
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {selected.firstName} {selected.lastName}
                  </p>
                  <p className="text-sm text-neutral-500">{selected.indexNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={changeStudent}
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
              <input
                id="studentSearch"
                autoComplete="off"
                placeholder="Search by index number or name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                className={inputClass}
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
                        Create a new student
                      </Link>
                    </p>
                  )}
                  {!searching &&
                    results.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectStudent(s)}
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
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Amount Paid (GHS)" htmlFor="amount" error={fieldErrors.amount}>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Expiry Date" htmlFor="expiresAt" error={fieldErrors.expiresAt}>
          <input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Notes (optional)" htmlFor="notes">
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </FormField>

      {formError && (
        <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {submitting ? "Issuing…" : "Issue Permit"}
      </button>
    </form>
  );
}
