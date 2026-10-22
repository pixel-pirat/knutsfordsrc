"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { hallMessageSchema } from "@/lib/validation";

type MessageRow = {
  id: string;
  subject: string;
  body: string;
  hallName: string | null;
  recipientCount: number;
  failedCount: number;
  sentAt: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommunicationsClient({ messages }: { messages: MessageRow[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [halls, setHalls] = useState<{ id: string; name: string }[]>([]);
  const [hallId, setHallId] = useState("ALL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    noEmailConfigured: boolean;
    audience: string;
  } | null>(null);

  useEffect(() => {
    if (!dialogOpen) return;
    fetch("/api/admin/halls/options")
      .then((res) => res.json())
      .then((data) => setHalls(data.halls ?? []))
      .catch(() => {});
  }, [dialogOpen]);

  function openDialog() {
    setSubject("");
    setBody("");
    setHallId("ALL");
    setFormError(null);
    setFieldErrors({});
    setResult(null);
    setDialogOpen(true);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setResult(null);

    const parsed = hallMessageSchema.safeParse({
      hallId: hallId === "ALL" ? "" : hallId,
      subject,
      body,
    });
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
      const res = await fetch("/api/admin/hall-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      const audience =
        hallId === "ALL"
          ? "all students"
          : (halls.find((h) => h.id === hallId)?.name ?? "the hall");
      setResult({
        sent: data.sent,
        failed: data.failed,
        noEmailConfigured: data.noEmailConfigured,
        audience,
      });
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Communications
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Send hall-specific information to the students under a hall
          </p>
        </div>
        <Button onClick={openDialog}>New Broadcast</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No broadcasts sent yet.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {messages.map((m) => (
              <li key={m.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                    {m.subject}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-gold/40 bg-gold/10 text-gold-dark dark:text-gold-light"
                  >
                    {m.hallName ?? "All Halls"}
                  </Badge>
                  <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                    {formatDateTime(m.sentAt)}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {m.body}
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  Emailed {m.recipientCount} student{m.recipientCount === 1 ? "" : "s"}
                  {m.failedCount > 0 ? (
                    <span className="text-red-500"> · {m.failedCount} failed</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
          </DialogHeader>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-gold/15 p-5 ring-1 ring-gold/30">
                <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                  Sent to {result.audience}
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {result.noEmailConfigured
                    ? "Email sending isn't configured yet, so no emails went out — the broadcast is recorded. Add a Resend API key to enable delivery."
                    : `${result.sent} delivered${result.failed ? `, ${result.failed} failed (students without a valid email config)` : ""}.`}
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label>Deliver to</Label>
                <Select value={hallId} onValueChange={(v) => setHallId(v ?? "ALL")}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All halls (all students)</SelectItem>
                    {halls.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} members only
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="com-subject">Subject</Label>
                <Input
                  id="com-subject"
                  className="mt-1.5"
                  placeholder="e.g. Hall maintenance notice"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {fieldErrors.subject && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.subject}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="com-body">Message</Label>
                <Textarea
                  id="com-body"
                  className="mt-1.5"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                {fieldErrors.body && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.body}
                  </p>
                )}
              </div>

              {halls.length === 0 && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  No halls created yet — create halls under Hall Updates first, or
                  send to all students.
                </p>
              )}

              {formError && (
                <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Send Broadcast"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
