import QRCode from "qrcode";
import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import { getStudentWithPermits } from "@/db/queries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { getAppUrl } from "@/lib/url";
import { StudentDetailClient } from "./StudentDetailClient";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_students")) {
    return <AccessRestricted />;
  }

  const { id } = await params;
  const student = await getStudentWithPermits(id);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center ring-1 ring-black/5">
        <p className="text-base font-semibold text-ink">Student Not Found</p>
        <Link href="/admin/students" className="mt-3 text-sm text-gold-dark hover:underline">
          Back to students
        </Link>
      </div>
    );
  }

  const qrDataUrl = await QRCode.toDataURL(`${getAppUrl()}/verify/${student.id}`, {
    margin: 1,
    width: 240,
  });

  return (
    <StudentDetailClient
      student={{
        id: student.id,
        indexNumber: student.indexNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        program: student.program,
        level: student.level,
        studyMode: student.studyMode,
        avatarUrl: student.avatarUrl,
        createdAt: student.createdAt.toISOString(),
      }}
      permits={student.permits.map((p) => ({
        id: p.id,
        referenceNumber: p.referenceNumber,
        amount: p.amount,
        cardStatus: p.cardStatus,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
        issuer: p.issuer,
      }))}
      qrDataUrl={qrDataUrl}
      canEdit={hasPermission(admin, "create_student")}
    />
  );
}
