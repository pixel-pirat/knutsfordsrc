import Image from "next/image";

export function PageBanner({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src={image} alt={imageAlt} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      </div>

      <div className="mx-auto flex min-h-[320px] max-w-7xl flex-col justify-center px-6 py-20 sm:min-h-[360px] lg:px-8">
        <span className="text-sm font-bold tracking-wide text-gold-light">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-200">
          {description}
        </p>
      </div>
    </section>
  );
}
