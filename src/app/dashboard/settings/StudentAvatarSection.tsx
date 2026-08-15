"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/AvatarUpload";

export function StudentAvatarSection({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(avatarUrl);

  async function handleUploaded(url: string) {
    setCurrent(url);
    await fetch("/api/profile/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    }).catch(() => {});
    router.refresh();
  }

  return <AvatarUpload name={name} avatarUrl={current} onUploaded={handleUploaded} />;
}
