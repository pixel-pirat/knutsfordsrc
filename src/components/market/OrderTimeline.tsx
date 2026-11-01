import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import {
  ORDER_EVENT_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatMarketplaceDateTime,
  type MarketplaceOrderEvent,
} from "@/lib/marketplace";

export function OrderTimeline({ events }: { events: MarketplaceOrderEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event, index) => {
        const cancelled = event.status === "cancelled";
        const Icon = cancelled
          ? XCircle
          : index === events.length - 1
            ? CheckCircle2
            : Clock3;

        return (
          <li key={event.id} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                cancelled
                  ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  : "bg-gold/15 text-gold-dark dark:text-gold-light"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                {ORDER_EVENT_LABELS[event.eventType] ?? event.eventType}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {event.actorName} · {formatMarketplaceDateTime(event.createdAt)}
              </p>
              {(event.status || event.paymentStatus) && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {event.status &&
                    `Order: ${ORDER_STATUS_LABELS[event.status] ?? event.status}`}
                  {event.status && event.paymentStatus ? " · " : ""}
                  {event.paymentStatus &&
                    `Payment: ${
                      PAYMENT_STATUS_LABELS[event.paymentStatus] ??
                      event.paymentStatus
                    }`}
                </p>
              )}
              {event.note && (
                <p className="mt-1 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                  {event.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
