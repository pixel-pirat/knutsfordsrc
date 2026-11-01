import { Badge } from "@/components/ui/badge";
import { COMPLAINT_STATUS_LABELS, COMPLAINT_STATUS_STYLES } from "@/lib/marketplace";

export function ComplaintStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={COMPLAINT_STATUS_STYLES[status] ?? COMPLAINT_STATUS_STYLES.open}
    >
      {COMPLAINT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
