import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { SettingsForm } from "./SettingsForm";
import { StudentAvatarSection } from "./StudentAvatarSection";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function SettingsPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile and account details
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-1">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            ACCOUNT
          </h2>
          <div className="mt-4">
            <StudentAvatarSection
              name={`${student.firstName} ${student.lastName}`}
              avatarUrl={student.avatarUrl}
            />
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-neutral-400">Index Number</dt>
              <dd className="mt-0.5 font-semibold text-ink">
                {student.indexNumber}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Name</dt>
              <dd className="mt-0.5 font-semibold text-ink">
                {student.firstName} {student.lastName}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-neutral-400">
            Your index number and name are set at signup and can&rsquo;t be
            changed here.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-2">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            PROFILE DETAILS
          </h2>
          <SettingsForm
            initial={{
              email: student.email ?? "",
              phone: student.phone ?? "",
              program: student.program ?? "",
              level: student.level ?? "",
              studyMode: student.studyMode ?? "",
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:max-w-2xl">
        <h2 className="text-sm font-bold tracking-wide text-neutral-400">
          CHANGE PASSWORD
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
