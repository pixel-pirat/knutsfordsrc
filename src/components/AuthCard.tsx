import Image from "next/image";
import Link from "next/link";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Knutsford University crest"
            width={440}
            height={398}
            className="h-14 w-auto"
          />
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            <span className="text-gold-dark">KNUTSFORD</span>{" "}
            <span className="text-ink">UNIVERSITY</span>
          </span>
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <span className="text-xs font-bold tracking-wide text-gold-dark">
            {eyebrow}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">{footer}</p>
      </div>
    </div>
  );
}
