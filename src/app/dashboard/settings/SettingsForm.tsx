"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClass } from "@/components/FormField";
import { profileSchema } from "@/lib/validation";

type InitialValues = {
  email: string;
  phone: string;
  program: string;
  level: string;
  studyMode: string;
};

export function SettingsForm({ initial }: { initial: InitialValues }) {
  const router = useRouter();
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [program, setProgram] = useState(initial.program);
  const [level, setLevel] = useState(initial.level);
  const [studyMode, setStudyMode] = useState(initial.studyMode);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = profileSchema.safeParse({
      email,
      phone,
      program,
      level,
      studyMode,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@knutsford.edu.gh"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Phone" htmlFor="phone" error={fieldErrors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="024 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Programme" htmlFor="program" error={fieldErrors.program}>
        <input
          id="program"
          name="program"
          placeholder="e.g. BSc Computer Science"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className={inputClass}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Level" htmlFor="level" error={fieldErrors.level}>
          <select
            id="level"
            name="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select level
            </option>
            <option value="100">Level 100</option>
            <option value="200">Level 200</option>
            <option value="300">Level 300</option>
            <option value="400">Level 400</option>
          </select>
        </FormField>

        <FormField
          label="Study Mode"
          htmlFor="studyMode"
          error={fieldErrors.studyMode}
        >
          <select
            id="studyMode"
            name="studyMode"
            value={studyMode}
            onChange={(e) => setStudyMode(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select study mode
            </option>
            <option value="regular">Regular</option>
            <option value="weekend">Weekend</option>
          </select>
        </FormField>
      </div>

      {formError && (
        <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {formError}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
          Profile updated successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
