import Image from "next/image";
import Link from "next/link";
import { galleryImages } from "@/data/site";

export function Gallery() {
  const preview = galleryImages.slice(0, 6);

  return (
    <section className="bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-bold tracking-wide text-gold-dark dark:text-gold-light">
              CAMPUS GALLERY
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-ink dark:text-neutral-100 sm:text-4xl">
              Life at Knutsford
            </h2>
          </div>
          <Link
            href="/gallery"
            className="hidden text-sm font-semibold text-gold-dark dark:text-gold-light hover:underline sm:block"
          >
            view all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-rows-2 md:grid-cols-4 md:gap-5">
          {preview.map((img) => (
            <div
              key={img.src}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 ring-1 ring-black/5 dark:ring-white/10 ${
                img.tall ? "sm:row-span-2" : ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
