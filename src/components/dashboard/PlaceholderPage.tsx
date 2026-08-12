import { HubIcon } from "@/components/icons";

export function PlaceholderPage({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center ring-1 ring-black/5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
          <HubIcon name={icon} className="h-7 w-7" />
        </div>
        <span className="mt-5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold tracking-wide text-gold-dark">
          COMING SOON
        </span>
        <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}
