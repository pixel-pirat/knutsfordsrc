"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SemesterConfig = {
  currentSemester?: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
};

export function SemesterSettings({ initial }: { initial: SemesterConfig | null }) {
  const [currentSemester, setCurrentSemester] = useState(initial?.currentSemester ?? "");
  const [academicYear, setAcademicYear] = useState(initial?.academicYear ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/semester", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSemester, academicYear, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sc-semester">Current Semester</Label>
          <Input
            id="sc-semester"
            className="mt-1.5"
            placeholder="e.g. First Semester"
            value={currentSemester}
            onChange={(e) => setCurrentSemester(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sc-year">Academic Year</Label>
          <Input
            id="sc-year"
            className="mt-1.5"
            placeholder="e.g. 2026/2027"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sc-start">Start Date</Label>
          <Input
            id="sc-start"
            type="date"
            className="mt-1.5"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sc-end">End Date</Label>
          <Input
            id="sc-end"
            type="date"
            className="mt-1.5"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 dark:bg-green-950/40 px-3.5 py-2.5 text-sm text-green-700 dark:text-green-400">
          Saved.
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
