"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/AvatarUpload";
import { UserAvatar } from "@/components/UserAvatar";
import { SectionHeader, TabFooter } from "@/components/shadcn-space/blocks/user-profile-02/shared";
import { executiveSelfProfileSchema } from "@/lib/validation";
import { SelfAchievementDialog, type SelfAchievement } from "./SelfAchievementDialog";

const SOCIAL_KEYS = ["twitter", "instagram", "facebook", "linkedin", "tiktok"] as const;

type Profile = {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
  yearGroupLabel: string;
};

export function ExecutiveProfileClient({
  profile,
  achievements: initialAchievements,
}: {
  profile: Profile;
  achievements: SelfAchievement[];
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    profile.socialLinks ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SelfAchievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAvatarUploaded(url: string) {
    setAvatarUrl(url);
    await fetch("/api/executive/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    }).catch(() => {});
    router.refresh();
  }

  async function handleSaveAbout(e: FormEvent) {
    e.preventDefault();
    const cleanedLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(([, v]) => v.trim())
    );
    const parsed = executiveSelfProfileSchema.safeParse({
      bio,
      avatarUrl: avatarUrl ?? "",
      socialLinks: cleanedLinks,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/executive/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function openNewAchievement() {
    setSelected(null);
    setDialogOpen(true);
  }

  function openAchievement(a: SelfAchievement) {
    setSelected(a);
    setDialogOpen(true);
  }

  async function handleDeleteAchievement(id: string) {
    if (!confirm("Delete this achievement? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/executive/achievements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAchievements((prev) => prev.filter((a) => a.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function refreshAchievements() {
    const res = await fetch("/api/executive/achievements");
    const data = await res.json();
    setAchievements(data.achievements ?? []);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <UserAvatar name={profile.name} avatarUrl={avatarUrl} size="lg" className="h-16 w-16" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
              {profile.name}
            </h1>
            <Badge variant="outline">{profile.position}</Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {profile.yearGroupLabel} Executive
          </p>
        </div>
      </div>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About Me</TabsTrigger>
          <TabsTrigger value="achievements">My Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <div className="mt-4 max-w-lg rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
            <form onSubmit={handleSaveAbout}>
              <div className="flex flex-col gap-5 p-6">
                <SectionHeader
                  title="Public profile"
                  description="Shown on the Know Your Executives hall of fame. Your name and position are set by an admin."
                />

                <div>
                  <Label>Profile Photo</Label>
                  <div className="mt-1.5">
                    <AvatarUpload
                      name={profile.name}
                      avatarUrl={avatarUrl}
                      onUploaded={handleAvatarUploaded}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="exp-bio">Bio</Label>
                  <Textarea
                    id="exp-bio"
                    className="mt-1.5"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Social Links</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                    {SOCIAL_KEYS.map((key) => (
                      <Input
                        key={key}
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={socialLinks[key] ?? ""}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <TabFooter note="Changes appear on the public page immediately.">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </TabFooter>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="mt-4 max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Personal wins credited to you on the Achievements page.
              </p>
              <Button onClick={openNewAchievement}>Add Achievement</Button>
            </div>

            {achievements.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-neutral-900 px-6 py-16 text-center ring-1 ring-black/5 dark:ring-white/10">
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  No achievements added yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-4 rounded-xl bg-white dark:bg-neutral-900 p-4 ring-1 ring-black/5 dark:ring-white/10"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink dark:text-neutral-100">{a.title}</p>
                      {a.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                          {a.description}
                        </p>
                      )}
                      {a.achievedAt && (
                        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                          {new Date(a.achievedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button
                        type="button"
                        onClick={() => openAchievement(a)}
                        className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAchievement(a.id)}
                        disabled={deletingId === a.id}
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                      >
                        {deletingId === a.id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SelfAchievementDialog
        achievement={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshAchievements}
      />
    </div>
  );
}
