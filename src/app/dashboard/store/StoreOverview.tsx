import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  Plus,
  Settings,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceStore } from "@/db/schema";
import {
  CATEGORY_LABELS,
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
} from "@/lib/marketplace";
import { SellerNav } from "./SellerNav";

export function StoreOverview({
  store,
  summary,
}: {
  store: MarketplaceStore;
  summary: {
    products: number;
    services: number;
    activeListings: number;
    lowStock: number;
    outOfStock: number;
  };
}) {
  return (
    <div>
      <SellerNav />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
              {store.name}
            </h1>
            <Badge
              variant="outline"
              className={STORE_STATUS_STYLES[store.status]}
            >
              {STORE_STATUS_LABELS[store.status] ?? store.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {CATEGORY_LABELS[store.category] ?? store.category} · Seller
            dashboard
          </p>
        </div>
        <Link
          href="/dashboard/market"
          className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
        >
          View marketplace
        </Link>
      </div>

      {store.status === "suspended" && store.statusReason && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
          Store suspended: {store.statusReason}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Package} label="Products" value={summary.products} />
        <StatCard icon={Wrench} label="Services" value={summary.services} />
        <StatCard
          icon={CheckCircle2}
          label="Active listings"
          value={summary.activeListings}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock"
          value={summary.lowStock}
          highlight={summary.lowStock > 0}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href="/dashboard/store/products"
          title="Add a product"
          description="Create a new product listing with price and stock."
          icon={Plus}
        />
        <QuickLink
          href="/dashboard/store/services"
          title="Add a service"
          description="Offer a bookable or on-demand service."
          icon={Plus}
        />
        <QuickLink
          href="/dashboard/store/inventory"
          title="Manage inventory"
          description={
            summary.outOfStock > 0
              ? `${summary.outOfStock} product${summary.outOfStock === 1 ? "" : "s"} out of stock.`
              : "Keep stock levels accurate and up to date."
          }
          icon={Package}
        />
        <QuickLink
          href="/dashboard/store/settings"
          title="Store settings"
          description="Update your storefront profile and contact details."
          icon={Settings}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/store/products"
          className="group rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-colors hover:bg-black/[0.02] dark:bg-neutral-900 dark:ring-white/10 dark:hover:bg-white/[0.03]"
        >
          <Package className="h-5 w-5 text-gold-dark dark:text-gold-light" />
          <p className="mt-3 text-sm font-bold text-ink dark:text-neutral-100">
            Products
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {summary.products} listing{summary.products === 1 ? "" : "s"} ·{" "}
            {summary.lowStock} low stock
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-dark dark:text-gold-light">
            Manage products
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/store/services"
          className="group rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-colors hover:bg-black/[0.02] dark:bg-neutral-900 dark:ring-white/10 dark:hover:bg-white/[0.03]"
        >
          <Wrench className="h-5 w-5 text-gold-dark dark:text-gold-light" />
          <p className="mt-3 text-sm font-bold text-ink dark:text-neutral-100">
            Services
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {summary.services} listing{summary.services === 1 ? "" : "s"}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-dark dark:text-gold-light">
            Manage services
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href="/dashboard/store/inventory"
          className="group rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-colors hover:bg-black/[0.02] dark:bg-neutral-900 dark:ring-white/10 dark:hover:bg-white/[0.03]"
        >
          <AlertTriangle className="h-5 w-5 text-gold-dark dark:text-gold-light" />
          <p className="mt-3 text-sm font-bold text-ink dark:text-neutral-100">
            Inventory
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {summary.lowStock} low stock · {summary.outOfStock} out of stock
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-dark dark:text-gold-light">
            Update stock
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p
        className={`mt-2 text-2xl font-extrabold ${
          highlight
            ? "text-orange-600 dark:text-orange-400"
            : "text-ink dark:text-neutral-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Plus;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 transition-colors hover:bg-black/[0.02] dark:bg-neutral-900 dark:ring-white/10 dark:hover:bg-white/[0.03]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink dark:text-neutral-100">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </span>
      </span>
    </Link>
  );
}
