import { getCurrentStudent } from "@/db/queries";
import { DuesOverview } from "@/components/dashboard/DuesOverview";

export default async function DashboardOverviewPage() {
  const student = await getCurrentStudent();

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Welcome back,{" "}
        <span className="font-semibold text-ink dark:text-neutral-100">{student?.firstName}</span>
      </p>
      <DuesOverview />
    </div>
  );
}
