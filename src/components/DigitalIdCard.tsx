import Image from "next/image";
import { UserAvatar } from "@/components/UserAvatar";

export function DigitalIdCard({
  name,
  indexNumber,
  program,
  level,
  avatarUrl,
  qrDataUrl,
}: {
  name: string;
  indexNumber: string;
  program: string | null;
  level: string | null;
  avatarUrl?: string | null;
  qrDataUrl: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wide text-gold-light">
            KNUTSFORD UNIVERSITY
          </span>
          <p className="text-xs text-neutral-400">Student Digital ID</p>
        </div>
        <Image
          src="/logo.png"
          alt="Knutsford University crest"
          width={440}
          height={398}
          className="h-10 w-auto opacity-90"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5">
        <UserAvatar name={name} avatarUrl={avatarUrl} className="h-16 w-16 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-white sm:text-xl">{name}</p>
          <p className="text-sm text-gold-light">{indexNumber}</p>
          <p className="mt-1 text-sm text-neutral-300">
            {[program, level && `Level ${level}`].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-white p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Verification QR code" className="h-20 w-20 sm:h-24 sm:w-24" />
        </div>
      </div>
    </div>
  );
}
