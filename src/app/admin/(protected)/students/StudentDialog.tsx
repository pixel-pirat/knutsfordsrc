"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/AvatarUpload";
import { UserAvatar } from "@/components/UserAvatar";
import { adminStudentCreateSchema, adminStudentUpdateSchema } from "@/lib/validation";
import { formatCurrency, getPermitStatus, permitStatusBadge } from "@/lib/permits";

type Mode = "create" | "view" | "edit";

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
  profileCompleted: boolean;
  avatarUrl: string | null;
  permits: {
    id: string;
    referenceNumber: string;
    amount: string | null;
    cardStatus: string;
    issuedAt: string;
    expiresAt: string | null;
    issuer: { id: string; name: string } | null;
  }[];
};

type FormState = {
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  level: string;
  studyMode: string;
  avatarUrl: string;
};

const emptyForm: FormState = {
  indexNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  program: "",
  level: "",
  studyMode: "",
  avatarUrl: "",
};

export function StudentDialog({
  studentId,
  open,
  onOpenChange,
  onSuccess,
}: {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(studentId ? "view" : "create");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // Reset transient UI state when the dialog opens for a (possibly new) student,
  // following React's "adjust state during render" pattern rather than an effect.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (studentId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      setTempPassword(null);
      if (studentId) {
        setMode("view");
        setLoading(true);
      } else {
        setMode("create");
        setDetail(null);
        setForm(emptyForm);
      }
    }
  }

  useEffect(() => {
    if (!open || !studentId) return;
    fetch(`/api/admin/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setDetail(data.student);
        setForm({
          indexNumber: data.student.indexNumber,
          firstName: data.student.firstName,
          lastName: data.student.lastName,
          email: data.student.email ?? "",
          phone: data.student.phone ?? "",
          program: data.student.program ?? "",
          level: data.student.level ?? "",
          studyMode: data.student.studyMode ?? "",
          avatarUrl: data.student.avatarUrl ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [open, studentId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = adminStudentCreateSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
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

      setTempPassword(data.temporaryPassword);
      onSuccess?.();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    if (!studentId) return;

    const parsed = adminStudentUpdateSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDetail((d) => (d ? { ...d, ...data.student } : d));
      setMode("view");
      onSuccess?.();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {mode === "create" && !tempPassword && (
          <>
            <DialogHeader>
              <DialogTitle>Create Student</DialogTitle>
              <DialogDescription>
                Fill in as much of the profile as you have — you can complete the rest later.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <StudentFormFields
                form={form}
                setField={setField}
                fieldErrors={fieldErrors}
                showAvatar
              />
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
                  {submitting ? "Creating…" : "Create Student"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {mode === "create" && tempPassword && (
          <>
            <DialogHeader>
              <DialogTitle>Student Created</DialogTitle>
            </DialogHeader>
            <div className="rounded-xl bg-gold/15 p-5 ring-1 ring-gold/30">
              <p className="text-sm font-semibold text-ink">
                {form.firstName} {form.lastName} ({form.indexNumber})
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Share this temporary password with the student so they can log in:
              </p>
              <p className="mt-3 rounded-md bg-white px-3 py-2 text-center font-mono text-sm font-semibold text-ink ring-1 ring-black/10">
                {tempPassword}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        )}

        {mode === "view" && (
          <>
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {loading || !detail ? (
              <p className="py-8 text-center text-sm text-neutral-400">Loading…</p>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={`${detail.firstName} ${detail.lastName}`}
                    avatarUrl={detail.avatarUrl}
                    className="h-16 w-16"
                  />
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {detail.firstName} {detail.lastName}
                    </p>
                    <p className="text-sm text-neutral-500">{detail.indexNumber}</p>
                    <Badge
                      variant="outline"
                      className={
                        detail.profileCompleted
                          ? "mt-1 border-green-200 bg-green-50 text-green-700"
                          : "mt-1 border-gold/30 bg-gold/15 text-gold-dark"
                      }
                    >
                      {detail.profileCompleted ? "Profile Complete" : "Profile Incomplete"}
                    </Badge>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 p-4 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-400">Email</dt>
                    <dd className="text-neutral-700">{detail.email ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Phone</dt>
                    <dd className="text-neutral-700">{detail.phone ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Programme</dt>
                    <dd className="text-neutral-700">{detail.program ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Level</dt>
                    <dd className="text-neutral-700">
                      {detail.level ? `Level ${detail.level}` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Study Mode</dt>
                    <dd className="capitalize text-neutral-700">
                      {detail.studyMode ?? "—"}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    Permits ({detail.permits.length})
                  </h3>
                  {detail.permits.length === 0 ? (
                    <p className="text-sm text-neutral-400">No permits issued yet.</p>
                  ) : (
                    <ul className="divide-y divide-black/5 rounded-xl ring-1 ring-black/5">
                      {detail.permits.map((p) => {
                        const status = getPermitStatus(p);
                        return (
                          <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink">
                                {p.referenceNumber}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {formatCurrency(p.amount)} &middot;{" "}
                                {p.issuer ? p.issuer.name : "Self"}
                              </p>
                            </div>
                            <Badge variant="outline" className={`shrink-0 capitalize ${permitStatusBadge[status]}`}>
                              {status}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Close
              </Button>
              <Button type="button" onClick={() => setMode("edit")} disabled={loading}>
                Edit Details
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === "edit" && (
          <>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <StudentFormFields
                form={form}
                setField={setField}
                fieldErrors={fieldErrors}
                showAvatar
              />
              {formError && (
                <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {formError}
                </p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMode("view")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StudentFormFields({
  form,
  setField,
  fieldErrors,
  showAvatar,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  fieldErrors: Record<string, string>;
  showAvatar?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showAvatar && (
        <AvatarUpload
          name={`${form.firstName || "?"} ${form.lastName || ""}`}
          avatarUrl={form.avatarUrl}
          onUploaded={(url) => setField("avatarUrl", url)}
        />
      )}

      <div>
        <Label htmlFor="sf-indexNumber">Index Number</Label>
        <Input
          id="sf-indexNumber"
          className="mt-1.5"
          placeholder="26103254"
          value={form.indexNumber}
          onChange={(e) => setField("indexNumber", e.target.value)}
        />
        {fieldErrors.indexNumber && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.indexNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sf-firstName">First Name</Label>
          <Input
            id="sf-firstName"
            className="mt-1.5"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="sf-lastName">Last Name</Label>
          <Input
            id="sf-lastName"
            className="mt-1.5"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sf-email">Email</Label>
          <Input
            id="sf-email"
            type="email"
            className="mt-1.5"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor="sf-phone">Phone</Label>
          <Input
            id="sf-phone"
            className="mt-1.5"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sf-program">Programme</Label>
        <Input
          id="sf-program"
          className="mt-1.5"
          placeholder="e.g. BSc Computer Science"
          value={form.program}
          onChange={(e) => setField("program", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Level</Label>
          <Select value={form.level} onValueChange={(v) => setField("level", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {["100", "200", "300", "400"].map((l) => (
                <SelectItem key={l} value={l}>
                  Level {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Study Mode</Label>
          <Select value={form.studyMode} onValueChange={(v) => setField("studyMode", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
