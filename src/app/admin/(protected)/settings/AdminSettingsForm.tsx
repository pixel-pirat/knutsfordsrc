"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "@/components/AvatarUpload";
import { adminProfileUpdateSchema } from "@/lib/validation";

export function AdminSettingsForm({
  initial,
}: {
  initial: { name: string; email: string; avatarUrl: string | null; role: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAvatarUploaded(url: string) {
    setAvatarUrl(url);
    await fetch("/api/admin/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    }).catch(() => {});
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = adminProfileUpdateSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Profile Photo</Label>
        <div className="mt-1.5">
          <AvatarUpload name={initial.name} avatarUrl={avatarUrl} onUploaded={handleAvatarUploaded} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="adminSettingsName">Full Name</Label>
          <Input
            id="adminSettingsName"
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label>Email</Label>
          <p className="mt-1.5 text-sm text-neutral-500">{initial.email}</p>
        </div>

        <div>
          <Label>Role</Label>
          <p className="mt-1.5 text-sm capitalize text-neutral-500">
            {initial.role.replace("_", " ")}
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-md bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
            Profile updated.
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
