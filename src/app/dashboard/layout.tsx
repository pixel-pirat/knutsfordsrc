import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileBanner } from "@/components/dashboard/ProfileBanner";
import type { PublicStudent } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  const publicStudent: PublicStudent = {
    id: student.id,
    indexNumber: student.indexNumber,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone,
    program: student.program,
    level: student.level,
    studyMode: student.studyMode,
    profileCompleted: student.profileCompleted,
    avatarUrl: student.avatarUrl,
  };

  return (
    <DashboardShell student={publicStudent}>
      {!publicStudent.profileCompleted && <ProfileBanner />}
      {children}
    </DashboardShell>
  );
}
