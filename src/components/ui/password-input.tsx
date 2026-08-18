"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "@/components/EyeIcons";

function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        data-slot="password-input"
        className={cn("pr-8", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export { PasswordInput };
