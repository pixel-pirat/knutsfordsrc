export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink dark:text-neutral-100"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-ink dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20";
