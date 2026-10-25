import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoreDirectory } from "@/components/market/StoreDirectory";

export const dynamic = "force-dynamic";

export default function DashboardMarketStoresPage() {
  return (
    <div>
      <Link
        href="/dashboard/market"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Marketplace
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Student stores
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Every store below has been approved by the Knutsford SRC.
        </p>
      </div>
      <StoreDirectory basePath="/dashboard/market" />
    </div>
  );
}
