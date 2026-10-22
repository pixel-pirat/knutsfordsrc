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
import { sportAnnouncementSchema } from "@/lib/validation";

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  eventId: string | null;
  eventTitle: string | null;
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

export function AnnouncementsClient({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sportEvents, setSportEvents] = useState<
    { id: string; title: string }[]
  >([]);
  const [eventOption, setEventOption] = useState("ALL");
  const [title, setTitle] = useState("");
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
    fetch("/api/admin/sports/events")
      .then((res) => res.json())
      .then((data) =>
        setSportEvents(
          data.events?.map((e: { id: string; title: string }) => ({
            id: e.id,
            title: e.title,
          })) ?? []
        )
      )
      .catch(() => {});
  }, [dialogOpen]);

  function openDialog() {
    setTitle("");
    setBody("");
    setEventOption("ALL");
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

    const parsed = sportAnnouncementSchema.safeParse({
      title,
      body,
      eventId: eventOption === "ALL" ? "" : eventOption,
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
      const res = await fetch("/api/admin/sports/announcements", {
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
        eventOption === "ALL"
          ? "all students"
          : (sportEvents.find((e) => e.id === eventOption)?.title ??
            "the sport activity's confirmed participants");
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
            Announcements
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Tournament news and updates, emailed to confirmed participants
          </p>
        </div>
        <Button onClick={openDialog}>New Announcement</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        {announcements.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No announcements sent yet.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {announcements.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                    {a.title}
                  </p>
                  {a.eventTitle && (
                    <Badge
                      variant="outline"
                      className="border-gold/40 bg-gold/10 text-gold-dark dark:text-gold-light"
                    >
                      {a.eventTitle}
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                    {formatDateTime(a.sentAt)}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {a.body}
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  Emailed {a.recipientCount} confirmed participant
                  {a.recipientCount === 1 ? "" : "s"}
                  {a.failedCount > 0 ? (
                    <span className="text-red-500"> · {a.failedCount} failed</span>
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
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-gold/15 p-5 ring-1 ring-gold/30">
                <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                  Sent to {result.audience}
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {result.noEmailConfigured
                    ? "Email sending isn't configured yet, so no emails went out — the announcement is recorded. Add a Resend API key to enable delivery."
                    : `${result.sent} delivered${result.failed ? `, ${result.failed} failed` : ""}.`}
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label>Send to</Label>
                <Select value={eventOption} onValueChange={(v) => setEventOption(v ?? "ALL")}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All students</SelectItem>
                    {sportEvents.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title} — confirmed participants
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  Selected activity updates go to the students whose participation
                  has been confirmed.
                </p>
              </div>

              <div>
                <Label htmlFor="ann-title">Title</Label>
                <Input
                  id="ann-title"
                  className="mt-1.5"
                  placeholder="e.g. Fixtures released for the Champions Cup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ann-body">Message</Label>
                <Textarea
                  id="ann-body"
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
                  {submitting ? "Sending…" : "Send Announcement"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
