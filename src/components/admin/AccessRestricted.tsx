export function AccessRestricted() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center ring-1 ring-black/5">
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold tracking-wide text-red-600">
        ACCESS RESTRICTED
      </span>
      <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
        You don&rsquo;t have permission to view this page. Ask a super admin to
        grant you access if you need it.
      </p>
    </div>
  );
}
