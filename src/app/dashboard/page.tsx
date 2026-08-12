import { getCurrentStudent } from "@/db/queries";
import { DuesOverview } from "@/components/dashboard/DuesOverview";

export default async function DashboardOverviewPage() {
  const student = await getCurrentStudent();

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500">
        Welcome back,{" "}
        <span className="font-semibold text-ink">{student?.firstName}</span>
      </p>
      <DuesOverview />
    </div>
  );
}
