import { Hero } from "@/components/Hero";
import { NewsTicker } from "@/components/NewsTicker";
import { DigitalHub } from "@/components/DigitalHub";
import { EventsMarket } from "@/components/EventsMarket";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";

// The ticker reads live announcements, so render this page per request.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <NewsTicker />
      <DigitalHub />
      <EventsMarket />
      <Gallery />
      <Footer />
    </>
  );
}
