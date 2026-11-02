import { Hero } from "@/components/Hero";
import { NewsTicker } from "@/components/NewsTicker";
import { DigitalHub } from "@/components/DigitalHub";
import { EventsMarket } from "@/components/EventsMarket";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { WeeklyLeaderboardCard } from "@/components/games/WeeklyLeaderboardCard";
import { getWeeklyLeaderboard } from "@/db/gameQueries";

// The ticker reads live announcements, so render this page per request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const leaderboard = await getWeeklyLeaderboard(5);

  return (
    <>
      <Hero />
      <NewsTicker />
      <DigitalHub />
      <EventsMarket />
      <Gallery />
      <Footer />
      <WeeklyLeaderboardCard rows={leaderboard} variant="floating" />
    </>
  );
}
