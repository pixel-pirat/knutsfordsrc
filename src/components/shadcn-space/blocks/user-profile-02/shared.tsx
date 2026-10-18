import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ToggleRow({
  title,
  description,
  badge,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
        <div className="flex items-center gap-1">
          <p className="font-medium text-foreground">{title}</p>
          {badge}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function TabFooter({
  note,
  children,
}: {
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-4 bg-muted px-6 py-4 sm:flex-row sm:items-center sm:gap-5">
      <p className="flex-1 text-sm text-muted-foreground">{note}</p>
      <div className="flex w-full sm:items-center sm:justify-end gap-2 sm:w-auto">
        {children}
      </div>
    </div>
  );
}

export function LabelValueCard({
  label,
  value,
  className,
  contentClassName,
  valueClassName = "text-base font-medium text-foreground",
  reverse = false,
}: {
  label: string;
  value: string;
  className?: string;
  contentClassName?: string;
  valueClassName?: string;
  reverse?: boolean;
}) {
  const labelEl = <p className="text-sm text-muted-foreground">{label}</p>;
  const valueEl = <p className={valueClassName}>{value}</p>;

  return (
    <Card
      className={cn(
        "gap-0.5 rounded-lg border border-border bg-card py-3 ring-0",
        className,
      )}
    >
      <CardContent
        className={cn("flex flex-col gap-0.5 px-4", contentClassName)}
      >
        {reverse ? (
          <>
            {valueEl}
            {labelEl}
          </>
        ) : (
          <>
            {labelEl}
            {valueEl}
          </>
        )}
      </CardContent>
    </Card>
  );
}
