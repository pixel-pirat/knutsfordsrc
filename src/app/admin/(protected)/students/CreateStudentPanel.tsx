"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClass } from "@/components/FormField";
import { adminStudentCreateSchema } from "@/lib/validation";

export function CreateStudentPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [indexNumber, setIndexNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{
    name: string;
    indexNumber: string;
    temporaryPassword: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = adminStudentCreateSchema.safeParse({ indexNumber, firstName, lastName });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setCreated({
        name: `${data.student.firstName} ${data.student.lastName}`,
        indexNumber: data.student.indexNumber,
        temporaryPassword: data.temporaryPassword,
      });
      setIndexNumber("");
      setFirstName("");
      setLastName("");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setCreated(null);
        }}
        className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        {open ? "Cancel" : "Create Student"}
      </button>

      {open && !created && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-lg rounded-2xl bg-white p-6 ring-1 ring-black/5"
        >
          <FormField label="Index Number" htmlFor="createIndexNumber" error={fieldErrors.indexNumber} hint="Starts with 261, e.g. 26103254">
            <input
              id="createIndexNumber"
              inputMode="numeric"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              className={inputClass}
              placeholder="26103254"
            />
          </FormField>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First Name" htmlFor="createFirstName" error={fieldErrors.firstName}>
              <input
                id="createFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="createLastName" error={fieldErrors.lastName}>
              <input
                id="createLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>

          {formError && (
            <p className="mt-4 rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Student"}
          </button>
        </form>
      )}

      {created && (
        <div className="mt-4 max-w-lg rounded-2xl bg-gold/15 p-5 ring-1 ring-gold/30">
          <p className="text-sm font-semibold text-ink">
            {created.name} ({created.indexNumber}) created
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Share this temporary password with the student so they can log in:
          </p>
          <p className="mt-3 rounded-md bg-white px-3 py-2 text-center font-mono text-sm font-semibold text-ink ring-1 ring-black/10">
            {created.temporaryPassword}
          </p>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setOpen(false);
            }}
            className="mt-4 text-xs font-semibold text-gold-dark hover:underline"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
