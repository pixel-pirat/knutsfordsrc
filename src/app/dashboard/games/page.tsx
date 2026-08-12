import { HubIcon } from "@/components/icons";
import { gameModes } from "@/data/site";

export default function DashboardGamesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Games
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Trivia, tournaments and leaderboards are on the way
        </p>
      </div>

      <div className="rounded-2xl bg-ink px-6 py-10 text-center sm:py-14">
        <span className="rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-light">
          COMING SOON
        </span>
        <p className="mx-auto mt-4 max-w-md text-base font-semibold text-white">
          Compete with other halls and faculties right from your dashboard.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {gameModes.map((mode) => (
          <div
            key={mode.title}
            className="rounded-2xl bg-white p-6 ring-1 ring-black/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-dark">
              <HubIcon name={mode.icon} className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">
              {mode.title}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-neutral-500">
              {mode.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
