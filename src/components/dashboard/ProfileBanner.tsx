import Link from "next/link";

export function ProfileBanner() {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl bg-gold/15 px-5 py-4 ring-1 ring-gold/30 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold text-ink">
          Your profile is incomplete
        </p>
        <p className="text-sm text-neutral-600">
          Add your email, phone, programme and level to unlock the full
          Digital Hub experience.
        </p>
      </div>
      <Link
        href="/dashboard/settings"
        className="shrink-0 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Complete Profile
      </Link>
    </div>
  );
}
