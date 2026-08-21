"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSettingsForm } from "./AdminSettingsForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProgramsManager } from "./ProgramsManager";
import { PermitExpirySettings } from "./PermitExpirySettings";

type ProgramRow = { id: string; name: string; active: boolean };

export function AdminSettingsTabs({
  profile,
  isSuperAdmin,
  initialPrograms,
  permitExpiryDays,
}: {
  profile: { name: string; email: string; avatarUrl: string | null; role: string };
  isSuperAdmin: boolean;
  initialPrograms: ProgramRow[];
  permitExpiryDays: number;
}) {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        {isSuperAdmin && <TabsTrigger value="programmes">Programmes</TabsTrigger>}
        {isSuperAdmin && <TabsTrigger value="permits">Permit Expiry</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile">
        <div className="mt-4 max-w-lg rounded-2xl bg-white p-6 ring-1 ring-black/5">
          <AdminSettingsForm initial={profile} />
        </div>
      </TabsContent>

      <TabsContent value="password">
        <div className="mt-4 max-w-lg rounded-2xl bg-white p-6 ring-1 ring-black/5">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400">
            CHANGE PASSWORD
          </h2>
          <ChangePasswordForm />
        </div>
      </TabsContent>

      {isSuperAdmin && (
        <TabsContent value="programmes">
          <div className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <ProgramsManager initialPrograms={initialPrograms} />
          </div>
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="permits">
          <div className="mt-4 max-w-lg rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <h2 className="mb-4 text-sm font-bold tracking-wide text-neutral-400">
              PERMIT EXPIRY POLICY
            </h2>
            <PermitExpirySettings initialDays={permitExpiryDays} />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
