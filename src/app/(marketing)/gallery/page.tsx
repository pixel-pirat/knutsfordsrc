import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/PageBanner";
import { galleryImages } from "@/data/site";

export const metadata: Metadata = {
  title: "Gallery | Knutsford University",
  description: "A look at campus life, events and people at Knutsford University.",
};

export default function GalleryPage() {
  return (
    <>
      <PageBanner
        eyebrow="CAMPUS GALLERY"
        title="Life at Knutsford, In Pictures"
        description="Lectures, commencement, late-night study sessions and everything in between."
        image="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=2000&q=80"
        imageAlt="Shelves of books in the university library"
      />

      <section className="bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
            {galleryImages.map((img) => (
              <div
                key={img.src}
                className="relative overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-black/5 dark:ring-white/10"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={img.tall ? 800 : 600}
                  className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
