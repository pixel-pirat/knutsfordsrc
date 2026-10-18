"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ContactInfo = {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  socialLinks?: Record<string, string>;
};

const SOCIAL_KEYS = ["twitter", "instagram", "facebook", "linkedin", "tiktok"] as const;

export function ContactInfoSettings({ initial }: { initial: ContactInfo | null }) {
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    initial?.socialLinks ?? {}
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const cleanedLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([, v]) => v.trim())
      );
      const res = await fetch("/api/admin/settings/contact-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, address, website, socialLinks: cleanedLinks }),
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
          <Label htmlFor="ci-email">Email</Label>
          <Input id="ci-email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ci-phone">Phone</Label>
          <Input id="ci-phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="ci-address">Address</Label>
        <Input id="ci-address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ci-website">Website</Label>
        <Input id="ci-website" className="mt-1.5" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div>
        <Label>Social Links</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2.5">
          {SOCIAL_KEYS.map((key) => (
            <Input
              key={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={socialLinks[key] ?? ""}
              onChange={(e) => setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          ))}
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
