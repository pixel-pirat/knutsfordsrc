"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { PageBanner } from "@/components/PageBanner";

type Profile = {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
};

type Achievement = {
  id: string;
  title: string;
  description: string | null;
  achievedAt: string | null;
  imageUrl: string | null;
  yearGroup: { id: string; label: string } | null;
  profile: { id: string; name: string; avatarUrl: string | null } | null;
};

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ExecutivesPageClient({
  yearGroups,
  selectedYearGroupId,
  hallOfFameSections,
  achievements,
  defaultTab,
}: {
  yearGroups: { id: string; label: string }[];
  selectedYearGroupId: string;
  hallOfFameSections: {
    yearGroup: { id: string; label: string } | null;
    profiles: Profile[];
  }[];
  achievements: Achievement[];
  defaultTab: string;
}) {
  const router = useRouter();
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  function handleYearGroupChange(value: string | null) {
    const params = new URLSearchParams();
    if (value && value !== "all") params.set("yearGroup", value);
    router.push(`/about/executives?${params.toString()}`);
  }

  return (
    <>
      <PageBanner
        eyebrow="KNOW YOUR EXECUTIVES"
        title="The People Behind the SRC"
        description="Meet the executives, past and present, and what each year group has achieved."
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2000&q=80"
        imageAlt="Knutsford students collaborating"
      />

      <section className="bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <Tabs defaultValue={defaultTab} className="gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="hall-of-fame">Hall of Fame</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              {yearGroups.length > 0 && (
                <Select value={selectedYearGroupId} onValueChange={handleYearGroupChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Year Groups</SelectItem>
                    {yearGroups.map((yg) => (
                      <SelectItem key={yg.id} value={yg.id}>
                        {yg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="hall-of-fame">
              {hallOfFameSections.every((s) => s.profiles.length === 0) ? (
                <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No executives published yet — check back soon.
                </p>
              ) : (
                <div className="space-y-12">
                  {hallOfFameSections.map(
                    (section) =>
                      section.profiles.length > 0 && (
                        <div key={section.yearGroup?.id ?? "none"}>
                          {section.yearGroup && (
                            <h2 className="mb-5 text-lg font-bold text-ink dark:text-neutral-100">
                              {section.yearGroup.label}
                            </h2>
                          )}
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {section.profiles.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setActiveProfile(p)}
                                className="flex flex-col items-center rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-8 text-center ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-md"
                              >
                                <UserAvatar
                                  name={p.name}
                                  avatarUrl={p.avatarUrl}
                                  size="lg"
                                  className="h-20 w-20"
                                />
                                <h3 className="mt-4 text-base font-semibold text-ink dark:text-neutral-100">
                                  {p.name}
                                </h3>
                                <p className="mt-0.5 text-sm font-medium text-gold-dark dark:text-gold-light">
                                  {p.position}
                                </p>
                                {p.bio && (
                                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                    {p.bio}
                                  </p>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="mx-auto max-w-3xl space-y-5 text-base leading-7 text-neutral-700 dark:text-neutral-300">
                <p>
                  The Students&rsquo; Representative Council (SRC) is the elected student body at
                  Knutsford University, responsible for representing student interests, organising
                  campus life, and running the Student Digital Hub.
                </p>
                <p>
                  Each academic year, a new executive team is elected to lead the SRC — from the
                  President down to departmental officers. This page keeps a running record of
                  every executive team, so their work and achievements aren&rsquo;t forgotten once
                  their term ends.
                </p>
                <p>
                  Use the Hall of Fame tab to browse executives by year group, or the Achievements
                  tab to see what each team accomplished during their term.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              {achievements.length === 0 ? (
                <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No achievements recorded yet.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-col overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-950 ring-1 ring-black/5 dark:ring-white/10"
                    >
                      {a.imageUrl && (
                        <div className="relative aspect-[16/10]">
                          <Image src={a.imageUrl} alt={a.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-base font-semibold text-ink dark:text-neutral-100">
                          {a.title}
                        </h3>
                        {a.description && (
                          <p className="mt-2 line-clamp-3 text-sm text-neutral-500 dark:text-neutral-400">
                            {a.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                          <span>{a.profile ? a.profile.name : a.yearGroup?.label ?? "SRC"}</span>
                          {formatDate(a.achievedAt) && <span>{formatDate(a.achievedAt)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={!!activeProfile} onOpenChange={(open) => !open && setActiveProfile(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          {activeProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">{activeProfile.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center text-center">
                <UserAvatar
                  name={activeProfile.name}
                  avatarUrl={activeProfile.avatarUrl}
                  size="lg"
                  className="h-24 w-24"
                />
                <h3 className="mt-4 text-xl font-bold text-ink dark:text-neutral-100">
                  {activeProfile.name}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-gold-dark dark:text-gold-light">
                  {activeProfile.position}
                </p>
                {activeProfile.bio && (
                  <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {activeProfile.bio}
                  </p>
                )}
                {activeProfile.socialLinks &&
                  Object.keys(activeProfile.socialLinks).length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      {Object.entries(activeProfile.socialLinks)
                        .filter(([, url]) => url)
                        .map(([key, url]) => (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-gold-dark dark:hover:text-gold-light hover:underline"
                          >
                            {SOCIAL_LABELS[key] ?? key}
                          </a>
                        ))}
                    </div>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
