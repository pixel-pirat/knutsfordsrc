import Image from "next/image";

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=2000&q=80"
          alt="Knutsford University students walking across campus"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      </div>

      <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-6 py-24 sm:min-h-[640px] lg:px-8">
        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-gold-light/40 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light backdrop-blur-sm">
          KNUTSFORD UNIVERSITY &middot; STUDENT DIGITAL HUB
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
          Your Whole Campus Life, In One Place
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-neutral-200 sm:text-lg">
          From academics to entrepreneurship, from campus life to career
          growth &mdash; Knutsford&rsquo;s digital hub brings every tool you
          need as a student into a single, secure account.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#hub"
            className="rounded-md bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-colors hover:bg-gold-light"
          >
            Explore the Digital Hub
          </a>
          <a
            href="#about"
            className="rounded-md border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
