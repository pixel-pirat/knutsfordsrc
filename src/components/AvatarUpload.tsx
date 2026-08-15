"use client";

import { useRef, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";

export function AvatarUpload({
  name,
  avatarUrl,
  onUploaded,
  size = "lg",
}: {
  name: string;
  avatarUrl?: string | null;
  onUploaded: (url: string) => void;
  size?: "default" | "sm" | "lg";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setPreview(null);
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar
          name={name}
          avatarUrl={preview ?? avatarUrl}
          size={size}
          className="h-16 w-16"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-black/5 disabled:opacity-60"
        >
          {avatarUrl || preview ? "Change photo" : "Upload photo"}
        </button>
        <p className="mt-1 text-xs text-neutral-400">JPG, PNG, WEBP or GIF, up to 5MB</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
