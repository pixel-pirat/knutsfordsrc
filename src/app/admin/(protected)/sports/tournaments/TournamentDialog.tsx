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
import { tournamentCreateSchema } from "@/lib/validation";

type FormState = {
  name: string;
  sport: string;
  eventOption: string; // "NONE" or a sport event id
  format: string;
  numberOfGroups: string;
  qualifiersPerGroup: string;
  description: string;
};

const emptyForm: FormState = {
  name: "",
  sport: "",
  eventOption: "NONE",
  format: "single_elimination",
  numberOfGroups: "2",
  qualifiersPerGroup: "1",
  description: "",
};

function TournamentFormFields({
  form,
  setField,
  fieldErrors,
  sportEvents,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  fieldErrors: Record<string, string>;
  sportEvents: { id: string; title: string; sport: string }[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="t-name">Tournament Name</Label>
        <Input
          id="t-name"
          className="mt-1.5"
          placeholder="e.g. SRC Champions Cup"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="t-sport">Sport</Label>
        <Input
          id="t-sport"
          className="mt-1.5"
          placeholder="e.g. Football"
          value={form.sport}
          onChange={(e) => setField("sport", e.target.value)}
        />
      </div>

      <div>
        <Label>Pair participants from</Label>
        <Select value={form.eventOption} onValueChange={(v) => setField("eventOption", v ?? "NONE")}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Any confirmed activity (manual add)</SelectItem>
            {sportEvents.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} ({e.sport})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Linking an activity lets you pull its confirmed participants in with one
          click when generating pairings.
        </p>
      </div>

      <div>
        <Label>Format</Label>
        <Select value={form.format} onValueChange={(v) => setField("format", v ?? form.format)}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_elimination">
              Single elimination (knockout)
            </SelectItem>
            <SelectItem value="round_robin">Round robin (league)</SelectItem>
            <SelectItem value="group_knockout">Group stage + knockout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.format === "group_knockout" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Number of groups</Label>
            <Input
              type="number"
              min={2}
              max={8}
              className="mt-1.5"
              value={form.numberOfGroups}
              onChange={(e) => setField("numberOfGroups", e.target.value)}
            />
          </div>
          <div>
            <Label>Qualifiers per group</Label>
            <Input
              type="number"
              min={1}
              max={4}
              className="mt-1.5"
              value={form.qualifiersPerGroup}
              onChange={(e) => setField("qualifiersPerGroup", e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="t-description">Description</Label>
        <Textarea
          id="t-description"
          className="mt-1.5"
          rows={3}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>
    </div>
  );
}

export function TournamentDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [sportEvents, setSportEvents] = useState<
    { id: string; title: string; sport: string }[]
  >([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/sports/events")
      .then((res) => res.json())
      .then((data) =>
        setSportEvents(data.events?.map((e: { id: string; title: string; sport: string }) => ({
          id: e.id,
          title: e.title,
          sport: e.sport,
        })) ?? [])
      )
      .catch(() => {});
  }, [open]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = tournamentCreateSchema.safeParse({
      name: form.name,
      sport: form.sport,
      description: form.description,
      format: form.format,
      eventId: form.eventOption === "NONE" ? "" : form.eventOption,
      numberOfGroups:
        form.format === "group_knockout" ? form.numberOfGroups : undefined,
      qualifiersPerGroup:
        form.format === "group_knockout" ? form.qualifiersPerGroup : undefined,
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
      const res = await fetch("/api/admin/sports/tournaments", {
        method: "POST",
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
      // go straight into the tournament to add participants and pair
      router.push(`/admin/sports/tournaments/${data.tournament.id}`);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Tournament</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TournamentFormFields
            form={form}
            setField={setField}
            fieldErrors={fieldErrors}
            sportEvents={sportEvents}
          />
          {formError && (
            <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Tournament"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
