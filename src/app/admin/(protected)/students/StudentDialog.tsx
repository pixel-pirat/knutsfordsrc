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
import { AvatarUpload } from "@/components/AvatarUpload";
import { adminStudentCreateSchema, adminStudentUpdateSchema } from "@/lib/validation";

type Mode = "create" | "edit";

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
  const mode: Mode = studentId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);

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
      setWelcomeEmailSent(false);
      if (studentId) {
        setLoading(true);
      } else {
        setForm(emptyForm);
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => setPrograms(data.programs ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || !studentId) return;
    fetch(`/api/admin/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
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
      setWelcomeEmailSent(Boolean(data.emailSent));
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
      onSuccess?.();
      onOpenChange(false);
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
                programs={programs}
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
              <p className="mt-3 text-xs text-neutral-500">
                {welcomeEmailSent
                  ? "These details, along with the login page link, have also been emailed to the student."
                  : "Email not sent (no email on file for this student, or email isn't configured yet) — share the password with them directly."}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        )}

        {mode === "edit" && (
          <>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            {loading ? (
              <p className="py-8 text-center text-sm text-neutral-400">Loading…</p>
            ) : (
              <form onSubmit={handleEdit} className="space-y-4">
                <StudentFormFields
                  form={form}
                  setField={setField}
                  fieldErrors={fieldErrors}
                  programs={programs}
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
                    {submitting ? "Saving…" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
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
  programs,
  showAvatar,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  fieldErrors: Record<string, string>;
  programs: { id: string; name: string }[];
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
        <Label>Programme</Label>
        <Select value={form.program} onValueChange={(v) => setField("program", v ?? "")}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue placeholder="Select programme" />
          </SelectTrigger>
          <SelectContent>
            {programs.length === 0 && (
              <p className="px-3 py-2 text-xs text-neutral-400">
                No programmes configured yet
              </p>
            )}
            {programs.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
