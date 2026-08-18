"use client";

import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { inputClass } from "@/components/FormField";
import { EyeIcon, EyeOffIcon } from "@/components/EyeIcons";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput({ className = "", ...props }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-10 ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
});
