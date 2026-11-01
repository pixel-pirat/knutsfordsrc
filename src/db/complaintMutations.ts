import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { marketplaceComplaintEvents, marketplaceComplaints } from "./schema";
import { canTransitionComplaint } from "@/lib/complaintWorkflow";
import type { MarketplaceComplaintStatus } from "@/lib/complaintWorkflow";

export type ComplaintActor = {
  type: "buyer" | "seller" | "admin";
  id: string;
  name: string;
};

export class ComplaintActionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ComplaintActionError";
    this.status = status;
  }
}

export async function updateComplaintStatus({
  complaintId,
  fromStatus,
  toStatus,
  actor,
  note,
}: {
  complaintId: string;
  fromStatus: string;
  toStatus: MarketplaceComplaintStatus;
  actor: ComplaintActor;
  note?: string | null;
}) {
  if (!canTransitionComplaint(fromStatus, toStatus)) {
    throw new ComplaintActionError(
      `A complaint that is ${fromStatus} cannot move to ${toStatus}.`,
      409
    );
  }

  const cleanNote = note?.trim() || null;
  if ((toStatus === "resolved" || toStatus === "rejected") && !cleanNote) {
    throw new ComplaintActionError(
      `A ${toStatus === "resolved" ? "resolution" : "rejection"} note is required.`
    );
  }

  const now = new Date();
  const setValues: {
    status: MarketplaceComplaintStatus;
    updatedAt: Date;
    resolutionNotes?: string | null;
    resolvedAt?: Date | null;
  } = {
    status: toStatus,
    updatedAt: now,
  };

  if (toStatus === "resolved" || toStatus === "rejected") {
    setValues.resolutionNotes = cleanNote;
    setValues.resolvedAt = now;
  }

  const [updated] = await db
    .update(marketplaceComplaints)
    .set(setValues)
    .where(
      and(
        eq(marketplaceComplaints.id, complaintId),
        eq(
          marketplaceComplaints.status,
          fromStatus as MarketplaceComplaintStatus
        )
      )
    )
    .returning();

  if (!updated) {
    throw new ComplaintActionError(
      "This complaint was updated by someone else. Refresh and try again.",
      409
    );
  }

  await db.insert(marketplaceComplaintEvents).values({
    complaintId,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    eventType:
      toStatus === "resolved"
        ? "resolved"
        : toStatus === "rejected"
          ? "rejected"
          : "status_changed",
    status: toStatus,
    note: cleanNote,
  });

  return updated;
}

export async function assignComplaint({
  complaintId,
  assign,
  actor,
}: {
  complaintId: string;
  assign: boolean;
  actor: ComplaintActor;
}) {
  const now = new Date();
  const [updated] = await db
    .update(marketplaceComplaints)
    .set({
      assignedAdminId: assign ? actor.id : null,
      updatedAt: now,
    })
    .where(eq(marketplaceComplaints.id, complaintId))
    .returning();

  if (!updated) {
    throw new ComplaintActionError("Complaint not found", 404);
  }

  await db.insert(marketplaceComplaintEvents).values({
    complaintId,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    eventType: assign ? "assigned" : "unassigned",
    status: updated.status,
    note: null,
  });

  return updated;
}

export async function addComplaintNote({
  complaintId,
  actor,
  note,
}: {
  complaintId: string;
  actor: ComplaintActor;
  note: string;
}) {
  const [complaint] = await db
    .select({ status: marketplaceComplaints.status })
    .from(marketplaceComplaints)
    .where(eq(marketplaceComplaints.id, complaintId));

  if (!complaint) {
    throw new ComplaintActionError("Complaint not found", 404);
  }

  await db
    .update(marketplaceComplaints)
    .set({ updatedAt: new Date() })
    .where(eq(marketplaceComplaints.id, complaintId));

  await db.insert(marketplaceComplaintEvents).values({
    complaintId,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    eventType: "note",
    status: complaint.status,
    note,
  });
}

export async function respondToComplaintAsSeller({
  complaintId,
  actor,
  note,
}: {
  complaintId: string;
  actor: ComplaintActor;
  note: string;
}) {
  const [complaint] = await db
    .select({ status: marketplaceComplaints.status })
    .from(marketplaceComplaints)
    .where(eq(marketplaceComplaints.id, complaintId));

  if (!complaint) {
    throw new ComplaintActionError("Complaint not found", 404);
  }
  if (complaint.status === "resolved" || complaint.status === "rejected") {
    throw new ComplaintActionError("This complaint is already closed.", 409);
  }

  const now = new Date();
  const nextStatus: MarketplaceComplaintStatus =
    complaint.status === "awaiting_seller_response"
      ? "under_investigation"
      : (complaint.status as MarketplaceComplaintStatus);

  await db
    .update(marketplaceComplaints)
    .set({ status: nextStatus, updatedAt: now })
    .where(eq(marketplaceComplaints.id, complaintId));

  await db.insert(marketplaceComplaintEvents).values({
    complaintId,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    eventType: "seller_response",
    status: nextStatus,
    note,
  });
}
