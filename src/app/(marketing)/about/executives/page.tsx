import type { Metadata } from "next";
import {
  listYearGroupsPublic,
  listProfilesForYearGroupPublic,
  listAchievementsPublic,
} from "@/db/queries";
import { ExecutivesPageClient } from "./ExecutivesPageClient";

export const metadata: Metadata = {
  title: "Know Your Executives | Knutsford University",
  description:
    "Meet the SRC executives, past and present, and the achievements of every year group.",
};

export default async function ExecutivesPage({
  searchParams,
}: {
  searchParams: Promise<{ yearGroup?: string; tab?: string }>;
}) {
  const { yearGroup, tab } = await searchParams;
  const yearGroups = await listYearGroupsPublic();

  const selected =
    yearGroup === "all"
      ? "all"
      : yearGroup && yearGroups.some((yg) => yg.id === yearGroup)
        ? yearGroup
        : (yearGroups[0]?.id ?? "all");

  const hallOfFameSections =
    selected === "all"
      ? await Promise.all(
          yearGroups.map(async (yg) => ({
            yearGroup: { id: yg.id, label: yg.label },
            profiles: await listProfilesForYearGroupPublic(yg.id),
          }))
        )
      : [
          {
            yearGroup: yearGroups.find((yg) => yg.id === selected) ?? null,
            profiles: selected ? await listProfilesForYearGroupPublic(selected) : [],
          },
        ];

  const achievements = await listAchievementsPublic({
    yearGroupId: selected === "all" ? undefined : selected || undefined,
    limit: 100,
  });

  return (
    <ExecutivesPageClient
      yearGroups={yearGroups.map((yg) => ({ id: yg.id, label: yg.label }))}
      selectedYearGroupId={selected}
      hallOfFameSections={hallOfFameSections.map((s) => ({
        yearGroup: s.yearGroup,
        profiles: s.profiles.map((p) => ({
          ...p,
          socialLinks: p.socialLinks as Record<string, string> | null,
        })),
      }))}
      achievements={achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        achievedAt: a.achievedAt ? a.achievedAt.toISOString() : null,
        imageUrl: a.imageUrl,
        yearGroup: a.yearGroup,
        profile: a.profile,
      }))}
      defaultTab={tab === "achievements" || tab === "about" ? tab : "hall-of-fame"}
    />
  );
}
