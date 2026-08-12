import { Header } from "@/components/Header";
import { SiteFooterBar } from "@/components/SiteFooterBar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <SiteFooterBar />
    </>
  );
}
