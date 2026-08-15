"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FormField, inputClass } from "@/components/FormField";
import { indexNumberSchema } from "@/lib/validation";
import { PERMIT_TYPES } from "@/data/admin";

type FoundStudent = {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  program: string | null;
  level: string | null;
};

type LookupState = "idle" | "loading" | "found" | "not_found" | "error";

export function PermitIssuanceFlow({
  canCreateStudent,
}: {
  canCreateStudent: boolean;
}) {
  const [indexNumber, setIndexNumber] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [student, setStudent] = useState<FoundStudent | null>(null);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");

  const [permitType, setPermitType] = useState(PERMIT_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    referenceNumber: string;
    temporaryPassword: string | null;
    studentName: string;
  } | null>(null);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    const parsed = indexNumberSchema.safeParse(indexNumber);
    if (!parsed.success) {
      setLookupError(parsed.error.issues[0]?.message ?? "Invalid index number");
      setLookupState("error");
      return;
    }

    setLookupState("loading");
    setLookupError(null);
    try {
      const res = await fetch(
        `/api/admin/students/lookup?indexNumber=${encodeURIComponent(parsed.data)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error ?? "Something went wrong. Please try again.");
        setLookupState("error");
        return;
      }
      if (data.student) {
        setStudent(data.student);
        setLookupState("found");
      } else {
        setStudent(null);
        setNewFirstName("");
        setNewLastName("");
        setLookupState("not_found");
      }
    } catch {
      setLookupError("Something went wrong. Please try again.");
      setLookupState("error");
    }
  }

  function resetLookup() {
    setLookupState("idle");
    setStudent(null);
    setLookupError(null);
    setResult(null);
    setIndexNumber("");
  }

  async function handleIssue(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const firstName = student?.firstName ?? newFirstName.trim();
    const lastName = student?.lastName ?? newLastName.trim();

    if (!student && (!firstName || !lastName)) {
      setSubmitError("Enter the student's first and last name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: { indexNumber, firstName, lastName },
          permitType,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult({
        referenceNumber: data.permit.referenceNumber,
        temporaryPassword: data.temporaryPassword,
        studentName: `${data.student.firstName} ${data.student.lastName}`,
      });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          PERMIT ISSUED
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-ink">
          {result.referenceNumber}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Issued to {result.studentName}
        </p>

        {result.temporaryPassword && (
          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-gold/15 p-5 text-left ring-1 ring-gold/30">
            <p className="text-sm font-semibold text-ink">
              New student account created
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Share this temporary password with the student so they can log in:
            </p>
            <p className="mt-3 rounded-md bg-white px-3 py-2 text-center font-mono text-sm font-semibold text-ink ring-1 ring-black/10">
              {result.temporaryPassword}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={resetLookup}
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
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-7">
        <h2 className="text-sm font-bold tracking-wide text-neutral-400">
          STEP 1 — FIND THE STUDENT
        </h2>
        <form onSubmit={handleLookup} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <FormField label="Index Number" htmlFor="lookupIndexNumber">
              <input
                id="lookupIndexNumber"
                inputMode="numeric"
                placeholder="26103254"
                value={indexNumber}
                onChange={(e) => {
                  setIndexNumber(e.target.value);
                  setLookupState("idle");
                }}
                className={inputClass}
              />
            </FormField>
          </div>
          <button
            type="submit"
            disabled={lookupState === "loading"}
            className="rounded-md bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {lookupState === "loading" ? "Searching…" : "Look Up"}
          </button>
        </form>
        {lookupError && (
          <p className="mt-3 text-sm text-red-600">{lookupError}</p>
        )}
      </div>

      {lookupState === "found" && student && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-neutral-400">
              STUDENT FOUND
            </h2>
            <button
              type="button"
              onClick={resetLookup}
              className="text-xs font-semibold text-gold-dark hover:underline"
            >
              search again
            </button>
          </div>
          <div className="mt-3 rounded-xl bg-neutral-50 p-4">
            <p className="font-semibold text-ink">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-neutral-500">{student.indexNumber}</p>
            {(student.program || student.level) && (
              <p className="mt-1 text-sm text-neutral-500">
                {[student.program, student.level && `Level ${student.level}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}

      {lookupState === "not_found" && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-neutral-400">
              NO STUDENT FOUND — CREATE PROFILE
            </h2>
            <button
              type="button"
              onClick={resetLookup}
              className="text-xs font-semibold text-gold-dark hover:underline"
            >
              search again
            </button>
          </div>
          {!canCreateStudent ? (
            <p className="mt-3 text-sm text-red-600">
              No student is registered with index number {indexNumber}, and
              you don&rsquo;t have permission to create student records. Ask a
              super admin for access, or have the student self-register.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-neutral-500">
                Index number {indexNumber} isn&rsquo;t registered yet. Enter
                their name to create a profile as part of issuing this permit.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="First Name" htmlFor="newFirstName">
                  <input
                    id="newFirstName"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Last Name" htmlFor="newLastName">
                  <input
                    id="newLastName"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </>
          )}
        </div>
      )}

      {(lookupState === "found" ||
        (lookupState === "not_found" && canCreateStudent)) && (
        <form
          onSubmit={handleIssue}
          className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-7"
        >
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            STEP 2 — PERMIT DETAILS
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Permit Type" htmlFor="permitType">
              <select
                id="permitType"
                value={permitType}
                onChange={(e) => setPermitType(e.target.value)}
                className={inputClass}
              >
                {PERMIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes (optional)" htmlFor="notes">
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>

          {submitError && (
            <p className="mt-4 rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {submitting ? "Issuing…" : "Issue Permit"}
          </button>
        </form>
      )}
    </div>
  );
}
