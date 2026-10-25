import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import {
  addApplicationEvent,
  createApplication,
  getApplicationForStudent,
  listApplicationEvents,
  resubmitApplication,
} from "@/db/marketplaceQueries";
import { marketplaceApplicationSchema } from "@/lib/validation";

function clean(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const application = await getApplicationForStudent(student.id);
  if (!application) {
    return NextResponse.json({ application: null, events: [] });
  }

  const events = await listApplicationEvents(application.id);
  return NextResponse.json({ application, events });
}

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const values = {
    contactNumber: data.contactNumber,
    storeName: data.storeName,
    category: data.category,
    description: data.description,
    offerings: data.offerings,
    availability: data.availability,
    fulfilmentMethods: data.fulfilmentMethods,
    evidenceUrl: clean(data.evidenceUrl),
    evidenceNotes: clean(data.evidenceNotes),
    declarationAccepted: data.declarationAccepted,
  };

  const existing = await getApplicationForStudent(student.id);
  const studentName = `${student.firstName} ${student.lastName}`;

  if (existing) {
    if (existing.status === "approved") {
      return NextResponse.json(
        { error: "Your store application has already been approved." },
        { status: 409 }
      );
    }
    if (
      existing.status === "pending_review" ||
      existing.status === "under_review"
    ) {
      return NextResponse.json(
        { error: "Your application is already being reviewed." },
        { status: 409 }
      );
    }

    const [application] = await resubmitApplication(existing.id, {
      ...values,
      status: "pending_review",
      decisionReason: null,
    });
    await addApplicationEvent({
      applicationId: existing.id,
      actorType: "student",
      actorId: student.id,
      actorName: studentName,
      status: "pending_review",
      note: "Application resubmitted",
    });

    return NextResponse.json({ application });
  }

  const [application] = await createApplication(student.id, {
    ...values,
    status: "pending_review",
  });
  await addApplicationEvent({
    applicationId: application.id,
    actorType: "student",
    actorId: student.id,
    actorName: studentName,
    status: "pending_review",
    note: "Application submitted",
  });

  return NextResponse.json({ application }, { status: 201 });
}
