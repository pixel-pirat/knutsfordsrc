"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import type {
  MarketplaceApplication,
  MarketplaceApplicationEvent,
  MarketplaceStore,
} from "@/db/schema";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  AVAILABILITY_LABELS,
  CATEGORY_LABELS,
  FULFILMENT_LABELS,
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
  formatMarketplaceDate,
} from "@/lib/marketplace";

type StudentSummary = {
  firstName: string;
  lastName: string;
  indexNumber: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  level: string | null;
};

const CATEGORY_OPTIONS = ["products", "services", "both"] as const;
const AVAILABILITY_OPTIONS = [
  "in_stock",
  "made_to_order",
  "service_on_demand",
] as const;
const FULFILMENT_OPTIONS = [
  "campus_pickup",
  "delivery",
  "digital",
  "service_appointment",
] as const;

const EDITABLE_STATUSES = ["additional_info_required", "rejected"];

export function StoreClient({
  student,
  application,
  store,
  events,
}: {
  student: StudentSummary;
  application: MarketplaceApplication | null;
  store: MarketplaceStore | null;
  events: MarketplaceApplicationEvent[];
}) {
  const needsApplication =
    !application || EDITABLE_STATUSES.includes(application.status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          My Store
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Apply to sell on the Knutsford Student Marketplace
        </p>
      </div>

      {application && (
        <StatusBanner application={application} />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {needsApplication && (
            <ApplicationForm
              student={student}
              application={application}
            />
          )}

          {application?.status === "approved" && !store && (
            <StoreForm
              mode="create"
              student={student}
              application={application}
            />
          )}

          {store && (
            <>
              <StoreSummary store={store} />
              <StoreForm mode="edit" student={student} store={store} />
            </>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Seller
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">
                  Name
                </dt>
                <dd className="text-neutral-700 dark:text-neutral-300">
                  {student.firstName} {student.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">
                  Index number
                </dt>
                <dd className="text-neutral-700 dark:text-neutral-300">
                  {student.indexNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">
                  University email
                </dt>
                <dd className="break-all text-neutral-700 dark:text-neutral-300">
                  {student.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-400 dark:text-neutral-500">
                  Programme
                </dt>
                <dd className="text-neutral-700 dark:text-neutral-300">
                  {student.program ?? "—"}
                  {student.level ? ` · Level ${student.level}` : ""}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              How it works
            </h2>
            <ol className="mt-3 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <Step number={1} done={!!application}>
                Submit your store application
              </Step>
              <Step
                number={2}
                done={
                  !!application &&
                  application.status !== "pending_review" &&
                  application.status !== "additional_info_required" &&
                  application.status !== "rejected"
                }
              >
                SRC reviews your application
              </Step>
              <Step number={3} done={application?.status === "approved"}>
                Set up your storefront
              </Step>
              <Step number={4} done={!!store}>
                Publish listings and start selling
              </Step>
            </ol>
          </section>

          {application && events.length > 0 && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:ring-white/10 dark:bg-neutral-900">
              <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
                Application history
              </h2>
              <ol className="mt-3 space-y-3">
                {events.map((event) => (
                  <li key={event.id} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {APPLICATION_STATUS_LABELS[event.status] ?? event.status}
                        <span className="ml-1.5 font-normal text-neutral-400 dark:text-neutral-500">
                          {formatMarketplaceDate(event.createdAt)}
                        </span>
                      </p>
                      {event.note && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ application }: { application: MarketplaceApplication }) {
  const title: Record<string, string> = {
    pending_review: "Application submitted",
    under_review: "Application under review",
    additional_info_required: "More information needed",
    approved: "You're approved to sell",
    rejected: "Application not approved",
  };

  const message: Record<string, string> = {
    pending_review:
      "The SRC will review your application and get back to you. You'll see updates here.",
    under_review:
      "The SRC is currently assessing your application. No action is needed right now.",
    additional_info_required:
      "Please update your application below and resubmit it for review.",
    approved:
      storeMessage(application),
    rejected:
      "You can review the reason below, update your details and resubmit your application.",
  };

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Application status
          </p>
          <h2 className="mt-1 text-lg font-bold text-ink dark:text-neutral-100">
            {title[application.status] ?? "Application"}
          </h2>
        </div>
        <Badge
          variant="outline"
          className={APPLICATION_STATUS_STYLES[application.status]}
        >
          {APPLICATION_STATUS_LABELS[application.status] ?? application.status}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
        {message[application.status] ?? ""}
      </p>
      {application.decisionReason &&
        (application.status === "additional_info_required" ||
          application.status === "rejected") && (
          <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2.5 text-sm text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
            {application.decisionReason}
          </p>
        )}
    </section>
  );
}

function storeMessage(application: MarketplaceApplication) {
  return application.storeName
    ? `Your application for ${application.storeName} was approved. Set up your storefront below to start selling.`
    : "Your seller application was approved. Set up your storefront below.";
}

function Step({
  number,
  done,
  children,
}: {
  number: number;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          done
            ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400"
            : "bg-black/5 text-neutral-400 dark:bg-white/10 dark:text-neutral-500"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span className={done ? "text-neutral-500 dark:text-neutral-400" : ""}>
        {children}
      </span>
    </li>
  );
}

function ApplicationForm({
  student,
  application,
}: {
  student: StudentSummary;
  application: MarketplaceApplication | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    contactNumber: application?.contactNumber ?? student.phone ?? "",
    storeName: application?.storeName ?? "",
    category: application?.category ?? "products",
    description: application?.description ?? "",
    offerings: application?.offerings ?? "",
    availability: application?.availability ?? "in_stock",
    fulfilmentMethods: application?.fulfilmentMethods?.length
      ? application.fulfilmentMethods
      : ["campus_pickup"],
    evidenceUrl: application?.evidenceUrl ?? "",
    evidenceNotes: application?.evidenceNotes ?? "",
    declarationAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleFulfilment(method: string) {
    setForm((current) => ({
      ...current,
      fulfilmentMethods: current.fulfilmentMethods.includes(method)
        ? current.fulfilmentMethods.filter((m) => m !== method)
        : [...current.fulfilmentMethods, method],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          evidenceUrl: form.evidenceUrl || undefined,
          evidenceNotes: form.evidenceNotes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not submit your application.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-gold-dark dark:text-gold-light" />
        <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
          {application ? "Update your application" : "Store application"}
        </h2>
      </div>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Tell the SRC about your business. Approved sellers get a storefront on
        the marketplace.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="store-name">Proposed store name</Label>
            <Input
              id="store-name"
              className="mt-1.5"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="e.g. Campus Cravings"
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="contact-number">Contact number</Label>
            <Input
              id="contact-number"
              className="mt-1.5"
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              placeholder="e.g. 024 000 0000"
              maxLength={30}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Business category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as typeof form.category })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {CATEGORY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              value={form.availability}
              onChange={(e) =>
                setForm({
                  ...form,
                  availability: e.target.value as typeof form.availability,
                })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {AVAILABILITY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {AVAILABILITY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Business description</Label>
          <Textarea
            id="description"
            className="mt-1.5"
            rows={3}
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does your business do? Who is it for?"
          />
        </div>

        <div>
          <Label htmlFor="offerings">Products / services offered</Label>
          <Textarea
            id="offerings"
            className="mt-1.5"
            rows={3}
            maxLength={1000}
            value={form.offerings}
            onChange={(e) => setForm({ ...form, offerings: e.target.value })}
            placeholder="List the main items or services you plan to sell"
          />
        </div>

        <div>
          <Label>Fulfilment methods</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FULFILMENT_OPTIONS.map((method) => (
              <label
                key={method}
                className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-neutral-700 dark:border-white/10 dark:text-neutral-300"
              >
                <input
                  type="checkbox"
                  checked={form.fulfilmentMethods.includes(method)}
                  onChange={() => toggleFulfilment(method)}
                />
                {FULFILMENT_LABELS[method]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Supporting evidence (optional)</Label>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Add a product photo, portfolio image or business documentation.
          </p>
          <div className="mt-2">
            <ImageUpload
              imageUrl={form.evidenceUrl}
              onUploaded={(url) => setForm({ ...form, evidenceUrl: url })}
              onRemove={() => setForm({ ...form, evidenceUrl: "" })}
            />
          </div>
          <Textarea
            className="mt-2"
            rows={2}
            maxLength={1000}
            value={form.evidenceNotes}
            onChange={(e) =>
              setForm({ ...form, evidenceNotes: e.target.value })
            }
            placeholder="Anything else the reviewer should know about your evidence (optional)"
          />
        </div>

        <label className="flex items-start gap-2.5 rounded-xl bg-black/[0.02] p-3 text-sm text-neutral-600 dark:bg-white/[0.03] dark:text-neutral-300">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.declarationAccepted}
            onChange={(e) =>
              setForm({ ...form, declarationAccepted: e.target.checked })
            }
          />
          <span>
            I declare that the information provided is accurate and I agree to
            follow the SRC marketplace policies, including responsible selling
            and honest product descriptions.
          </span>
        </label>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting
            ? "Submitting…"
            : application
              ? "Resubmit application"
              : "Submit application"}
        </Button>
      </form>
    </section>
  );
}

function StoreSummary({ store }: { store: MarketplaceStore }) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Your storefront
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-ink dark:text-neutral-100">
            {store.name}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {CATEGORY_LABELS[store.category] ?? store.category}
          </p>
        </div>
        <Badge
          variant="outline"
          className={STORE_STATUS_STYLES[store.status]}
        >
          {STORE_STATUS_LABELS[store.status] ?? store.status}
        </Badge>
      </div>

      {store.status === "suspended" && store.statusReason && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {store.statusReason}
        </p>
      )}

      <p className="mt-4 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
        {store.description || "No store description yet."}
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Fulfilment
          </dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {store.fulfilmentMethods
              .map((method) => FULFILMENT_LABELS[method] ?? method)
              .join(", ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Operating hours
          </dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {store.operatingHours || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Pickup location
          </dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {store.pickupLocation || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Contact
          </dt>
          <dd className="break-all text-neutral-700 dark:text-neutral-300">
            {store.contactEmail || store.contactPhone || "—"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-gold/10 px-3 py-2.5 text-xs text-neutral-600 dark:text-neutral-300">
        Product listings, inventory and orders are coming in the next phase of
        the marketplace. Your storefront is ready in the meantime.
      </p>
    </section>
  );
}

function StoreForm({
  mode,
  student,
  application,
  store,
}: {
  mode: "create" | "edit";
  student: StudentSummary;
  application?: MarketplaceApplication;
  store?: MarketplaceStore;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: store?.name ?? application?.storeName ?? "",
    description: store?.description ?? application?.description ?? "",
    category: store?.category ?? application?.category ?? "products",
    logoUrl: store?.logoUrl ?? "",
    contactEmail: store?.contactEmail ?? student.email ?? "",
    contactPhone: store?.contactPhone ?? application?.contactNumber ?? "",
    fulfilmentMethods:
      store?.fulfilmentMethods?.length
        ? store.fulfilmentMethods
        : application?.fulfilmentMethods?.length
          ? application.fulfilmentMethods
          : ["campus_pickup"],
    operatingHours: store?.operatingHours ?? "",
    pickupLocation: store?.pickupLocation ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleFulfilment(method: string) {
    setForm((current) => ({
      ...current,
      fulfilmentMethods: current.fulfilmentMethods.includes(method)
        ? current.fulfilmentMethods.filter((m) => m !== method)
        : [...current.fulfilmentMethods, method],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/store", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logoUrl: form.logoUrl || undefined,
          description: form.description || undefined,
          contactEmail: form.contactEmail || undefined,
          contactPhone: form.contactPhone || undefined,
          operatingHours: form.operatingHours || undefined,
          pickupLocation: form.pickupLocation || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save your store.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save your store. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
        {mode === "create" ? "Set up your store" : "Store settings"}
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {mode === "create"
          ? "Your seller application is approved. Fill in your storefront details to go live."
          : "Keep your storefront details, contact information and availability up to date."}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label>Store logo</Label>
          <div className="mt-2">
            <ImageUpload
              imageUrl={form.logoUrl}
              onUploaded={(url) => setForm({ ...form, logoUrl: url })}
              onRemove={() => setForm({ ...form, logoUrl: "" })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shop-name">Store name</Label>
            <Input
              id="shop-name"
              className="mt-1.5"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="shop-category">Category</Label>
            <select
              id="shop-category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as typeof form.category })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {CATEGORY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="shop-description">Store description</Label>
          <Textarea
            id="shop-description"
            className="mt-1.5"
            rows={3}
            maxLength={2000}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Introduce your store to customers"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shop-email">Contact email</Label>
            <Input
              id="shop-email"
              type="email"
              className="mt-1.5"
              value={form.contactEmail}
              onChange={(e) =>
                setForm({ ...form, contactEmail: e.target.value })
              }
              placeholder="store@example.com"
            />
          </div>
          <div>
            <Label htmlFor="shop-phone">Contact phone</Label>
            <Input
              id="shop-phone"
              className="mt-1.5"
              value={form.contactPhone}
              onChange={(e) =>
                setForm({ ...form, contactPhone: e.target.value })
              }
              maxLength={30}
            />
          </div>
        </div>

        <div>
          <Label>Fulfilment methods</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FULFILMENT_OPTIONS.map((method) => (
              <label
                key={method}
                className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-neutral-700 dark:border-white/10 dark:text-neutral-300"
              >
                <input
                  type="checkbox"
                  checked={form.fulfilmentMethods.includes(method)}
                  onChange={() => toggleFulfilment(method)}
                />
                {FULFILMENT_LABELS[method]}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shop-hours">Operating hours</Label>
            <Input
              id="shop-hours"
              className="mt-1.5"
              value={form.operatingHours}
              onChange={(e) =>
                setForm({ ...form, operatingHours: e.target.value })
              }
              placeholder="e.g. Mon–Fri, 9am–5pm"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="shop-pickup">Pickup location</Label>
            <Input
              id="shop-pickup"
              className="mt-1.5"
              value={form.pickupLocation}
              onChange={(e) =>
                setForm({ ...form, pickupLocation: e.target.value })
              }
              placeholder="e.g. Unity Hall reception"
              maxLength={200}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
            Store saved.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create store"
                : "Save changes"}
          </Button>
          {mode === "create" && (
            <Link
              href="/dashboard/market"
              className="text-sm font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
            >
              Back to marketplace
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
