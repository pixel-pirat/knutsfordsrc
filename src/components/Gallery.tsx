import Image from "next/image";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    alt: "Graduates celebrating at commencement",
    span: "sm:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    alt: "Students studying together in the library",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    alt: "Guest lecture in the main auditorium",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800&q=80",
    alt: "Packed lecture hall during orientation week",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80",
    alt: "Students in a classroom session",
    span: "sm:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80",
    alt: "A student working on a laptop",
    span: "",
  },
];

export function Gallery() {
  return (
    <section id="gallery" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-bold tracking-wide text-gold-dark">
              CAMPUS GALLERY
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
              Life at Knutsford
            </h2>
          </div>
          <a
            href="#gallery"
            className="hidden text-sm font-semibold text-gold-dark hover:underline sm:block"
          >
            view all
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-rows-2 md:grid-cols-4 md:gap-5">
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-black/5 ${img.span}`}
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
