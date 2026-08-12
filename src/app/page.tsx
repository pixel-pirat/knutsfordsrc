import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { NewsTicker } from "@/components/NewsTicker";
import { DigitalHub } from "@/components/DigitalHub";
import { EventsMarket } from "@/components/EventsMarket";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { SiteFooterBar } from "@/components/SiteFooterBar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <NewsTicker />
        <DigitalHub />
        <EventsMarket />
        <Gallery />
        <Footer />
      </main>
      <SiteFooterBar />
    </div>
  );
}
