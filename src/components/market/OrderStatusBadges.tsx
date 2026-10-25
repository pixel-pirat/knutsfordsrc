import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
} from "@/lib/marketplace";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.pending}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({
  paymentStatus,
}: {
  paymentStatus: string;
}) {
  return (
    <Badge
      variant="outline"
      className={
        PAYMENT_STATUS_STYLES[paymentStatus] ?? PAYMENT_STATUS_STYLES.unpaid
      }
    >
      {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}
    </Badge>
  );
}
