import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Games | Knutsford University",
  description:
    "Take a break with retro arcade games on the Knutsford Student Digital Hub — draughts, breakout, snake and 2048, with a campus leaderboard.",
};

const liveGames = [
  { title: "Draughts", description: "Classic checkers against the computer. Captures are mandatory.", emoji: "⚫" },
  { title: "Breakout", description: "Paddle, ball, bricks — clear the board without losing all your lives.", emoji: "🧱" },
  { title: "Snake", description: "Grow as long as you can without hitting the walls or yourself.", emoji: "🐍" },
  { title: "2048", description: "Slide and merge tiles to reach 2048 and beyond.", emoji: "🔢" },
];

export default function GamesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=2000&q=80"
            alt="Students playing video games together"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
        </div>

        <div className="mx-auto flex min-h-[440px] max-w-7xl flex-col items-start justify-center px-6 py-24 sm:min-h-[500px] lg:px-8">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-gold-light/40 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light backdrop-blur-sm">
            NOW LIVE
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl">
            Games Have Landed on the Digital Hub
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-200 sm:text-lg">
            Take a break with a few retro classics, right from your student
            dashboard, and climb the campus leaderboard as you play.
          </p>
          <Link
            href="/login"
            className="mt-9 rounded-md bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-colors hover:bg-gold-light"
          >
            Log in to play
          </Link>
        </div>
      </section>

      <section className="bg-cream dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-12 max-w-xl">
            <span className="text-sm font-bold tracking-wide text-gold-dark dark:text-gold-light">
              WHAT&apos;S LIVE
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink dark:text-neutral-100 sm:text-4xl">
              Four Ways to Play
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {liveGames.map((mode) => (
              <div
                key={mode.title}
                className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-xl">
                  {mode.emoji}
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink dark:text-neutral-100">
                  {mode.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {mode.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-3 rounded-2xl bg-ink px-8 py-10 text-center">
            <span className="rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light">
              CAMPUS LEADERBOARD
            </span>
            <p className="max-w-md text-lg font-semibold text-white">
              Every score counts toward the campus leaderboard — log in and see
              where you rank.
            </p>
            <Link
              href="/login"
              className="mt-2 text-sm font-semibold text-gold-light hover:underline"
            >
              Log in to play
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
