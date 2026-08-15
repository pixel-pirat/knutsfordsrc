import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { getAdminSession } from "@/lib/adminAuth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const [studentSession, adminSession] = await Promise.all([
    getSession(),
    getAdminSession(),
  ]);

  if (!studentSession && !adminSession) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP or GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image must be smaller than 5MB" },
      { status: 400 }
    );
  }

  const actorId = studentSession?.studentId ?? adminSession?.adminId;
  const ext = file.name.split(".").pop() || "jpg";
  const pathname = `avatars/${actorId}-${Date.now()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}
