import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";
import { HubIcon } from "@/components/icons";
import { aboutStats, aboutValues } from "@/data/site";

export const metadata: Metadata = {
  title: "About | Knutsford University",
  description:
    "Learn about Knutsford University's mission, values and community — and the Student Digital Hub built to serve it.",
};

export default function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="ABOUT KNUTSFORD"
        title="A Community Built on Faith, Excellence and Innovation"
        description="Since 2007, Knutsford University has grown into one of the region's most vibrant campuses — and the Student Digital Hub is how we bring that community online."
        image="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=2000&q=80"
        imageAlt="Knutsford University academic block"
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-16 sm:grid-cols-4 lg:px-8">
          {aboutStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-gold-dark sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-black/5">
            <Image
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1000&q=80"
              alt="Knutsford students catching up between classes"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wide text-gold-dark">
              OUR MISSION
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              Preparing Students for Life, Not Just Graduation
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-neutral-700">
              We believe university should equip students with more than a
              degree — academic rigour, real community, and the practical
              tools to manage campus life, find opportunity, and lead. The
              Student Digital Hub is an extension of that mission: dues,
              elections, jobs, and academics, all in one secure place.
            </p>
            <Link
              href="/#hub"
              className="mt-8 inline-block rounded-md bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Explore the Digital Hub
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-12 max-w-xl">
            <span className="text-sm font-bold tracking-wide text-gold-dark">
              WHAT WE STAND FOR
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              Our Values
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-neutral-50 p-6 ring-1 ring-black/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-dark">
                  <HubIcon name={value.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {value.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-neutral-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
