"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSettingsForm } from "./AdminSettingsForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProgramsManager } from "./ProgramsManager";
import { PermitExpirySettings } from "./PermitExpirySettings";
import { ContactInfoSettings, type ContactInfo } from "./ContactInfoSettings";
import { SemesterSettings, type SemesterConfig } from "./SemesterSettings";
import { PermitConfigSettings, type PermitConfig } from "./PermitConfigSettings";

type ProgramRow = { id: string; name: string; active: boolean };

const VALID_TABS = ["profile", "password", "programmes", "permit-config", "site"];

export function AdminSettingsTabs({
  profile,
  isSuperAdmin,
  initialPrograms,
  permitExpiryDate,
  contactInfo,
  semesterConfig,
  permitConfig,
}: {
  profile: {
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
  };
  isSuperAdmin: boolean;
  initialPrograms: ProgramRow[];
  permitExpiryDate: string | null;
  contactInfo: ContactInfo | null;
  semesterConfig: SemesterConfig | null;
  permitConfig: PermitConfig | null;
}) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const defaultTab =
    requestedTab && VALID_TABS.includes(requestedTab) ? requestedTab : "profile";

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        {isSuperAdmin && <TabsTrigger value="programmes">Programmes</TabsTrigger>}
        {isSuperAdmin && <TabsTrigger value="permit-config">Permit Config</TabsTrigger>}
        {isSuperAdmin && <TabsTrigger value="site">Site Settings</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile">
        <div className="mt-4 max-w-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <AdminSettingsForm initial={profile} />
        </div>
      </TabsContent>

      <TabsContent value="password">
        <div className="mt-4 max-w-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            CHANGE PASSWORD
          </h2>
          <ChangePasswordForm />
        </div>
      </TabsContent>

      {isSuperAdmin && (
        <TabsContent value="programmes">
          <div className="mt-4 rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
            <ProgramsManager initialPrograms={initialPrograms} />
          </div>
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="permit-config">
          <div className="mt-4 max-w-lg space-y-6">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
                PERMIT DEFAULTS
              </h2>
              <PermitConfigSettings initial={permitConfig} />
            </div>

            <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
                PERMIT EXPIRY POLICY
              </h2>
              <PermitExpirySettings initialDate={permitExpiryDate} />
            </div>
          </div>
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="site">
          <div className="mt-4 max-w-lg space-y-6">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
                CONTACT INFO
              </h2>
              <ContactInfoSettings initial={contactInfo} />
            </div>

            <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
                CURRENT SEMESTER
              </h2>
              <SemesterSettings initial={semesterConfig} />
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
