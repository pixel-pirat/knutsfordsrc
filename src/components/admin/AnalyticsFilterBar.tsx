"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AnalyticsFilterField = {
  key: string;
  label: string;
  /** Currently selected option's value. */
  value: string;
  /** Full option list for this field — include an "All ___" entry yourself if relevant. */
  options: { value: string; label: string }[];
  /** The option value that means "no filter" and should be omitted from the URL. Leave unset if every option is a real, always-present value (e.g. a date range, which has no "unset" state). */
  allValue?: string;
};

export function AnalyticsFilterBar({
  basePath,
  fields,
}: {
  basePath: string;
  fields: AnalyticsFilterField[];
}) {
  const router = useRouter();

  function navigate(changedKey: string, changedValue: string) {
    const params = new URLSearchParams();
    for (const f of fields) {
      const v = f.key === changedKey ? changedValue : f.value;
      const isAll = f.allValue !== undefined && v === f.allValue;
      if (!isAll && v) params.set(f.key, v);
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 p-3 ring-1 ring-black/5 dark:ring-white/10">
      {fields.map((f) => (
        <Select
          key={f.key}
          value={f.value || f.allValue || f.options[0]?.value}
          onValueChange={(v) => v && navigate(f.key, v)}
        >
          <SelectTrigger className="h-9 w-auto min-w-36">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
