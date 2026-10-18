import { getCurrentAdmin, getProfileByAdminUserId, listAchievementsForAdmin } from "@/db/adminQueries";
import { redirect } from "next/navigation";
import { ExecutiveProfileClient } from "./ExecutiveProfileClient";

export default async function ExecutiveProfilePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const profile = await getProfileByAdminUserId(admin.id);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-neutral-900 px-6 py-20 text-center ring-1 ring-black/5 dark:ring-white/10">
        <p className="text-base font-semibold text-ink dark:text-neutral-100">No Executive Profile</p>
        <p className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          You&rsquo;re not linked to an executive profile. Ask a super admin to link your account
          from Executives &rarr; Profiles if you should have one.
        </p>
      </div>
    );
  }

  const achievements = await listAchievementsForAdmin({ profileId: profile.id });

  return (
    <ExecutiveProfileClient
      profile={{
        id: profile.id,
        name: profile.name,
        position: profile.position,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        socialLinks: profile.socialLinks as Record<string, string> | null,
        yearGroupLabel: profile.yearGroup?.label ?? "—",
      }}
      achievements={achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        achievedAt: a.achievedAt ? a.achievedAt.toISOString() : null,
        imageUrl: a.imageUrl,
      }))}
    />
  );
}
