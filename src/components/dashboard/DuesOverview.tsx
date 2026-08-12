import Image from "next/image";
import Link from "next/link";
import { dues } from "@/data/dashboard";
import { quickLinks } from "@/data/site";

const dashboardQuickLinkHrefs: Record<string, string> = {
  "Pay Dues": "/dashboard/dues",
  "Visit the Market": "/dashboard/market",
  "Tournament of Power": "/dashboard/games",
};

const dashboardQuickLinks = quickLinks.filter(
  (link) => link in dashboardQuickLinkHrefs
);

export function DuesOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          SRC Dues
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your SRC dues contribution, payments and receipts
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8">
            <span className="text-xs font-bold tracking-wide text-gold-light">
              CURRENT DUES STATUS
            </span>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-4xl font-extrabold text-white sm:text-5xl">
                  {dues.amount}
                </p>
                <p className="mt-3 text-sm font-semibold text-gold-light">
                  {dues.status}
                </p>
                <p className="mt-4 text-sm text-neutral-300">{dues.term}</p>
                <p className="text-sm text-neutral-300">
                  Payment Deadline{" "}
                  <span className="font-semibold text-red-400">
                    {dues.deadline}
                  </span>
                </p>
                <button
                  type="button"
                  className="mt-6 rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
                >
                  Pay Dues Now
                </button>
              </div>
              <Image
                src="/logo.png"
                alt="Knutsford University crest"
                width={440}
                height={398}
                className="hidden h-32 w-auto shrink-0 opacity-90 sm:block"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-8">
            <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <p className="text-sm font-semibold text-neutral-400">
                  Total Dues
                </p>
                <p className="mt-2 text-lg font-bold text-ink sm:text-xl">
                  {dues.total}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-400">Paid</p>
                <p className="mt-2 text-lg font-bold text-ink sm:text-xl">
                  {dues.paid}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-400">
                  Balance
                </p>
                <p className="mt-2 text-lg font-bold text-ink sm:text-xl">
                  {dues.balance}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gold/15 p-6 ring-1 ring-gold/30">
            <h2 className="text-center text-sm font-extrabold tracking-wide text-ink">
              PAYMENT REMINDER
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              You have an Outstanding balance for {dues.term}
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
            >
              Pay Dues Now
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <h2 className="text-lg font-extrabold text-ink">QUICK LINKS</h2>
            <ul className="mt-4 space-y-2.5">
              {dashboardQuickLinks.map((link) => (
                <li key={link}>
                  <Link
                    href={dashboardQuickLinkHrefs[link]}
                    className="text-sm text-neutral-700 transition-colors hover:text-gold-dark"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-5 w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Learn More
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <h2 className="text-base font-bold text-ink">Need Help?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              For any dues payment inquiries, contact the SRC finance office.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-8">
        <h2 className="text-xl font-extrabold text-ink">Payment History</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  No payments yet. Your receipts will show up here once you
                  make a payment.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
