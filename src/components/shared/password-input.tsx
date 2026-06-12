"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import type { InputHTMLAttributes, ReactElement } from "react";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>): ReactElement {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
        <Lock className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
      </div>
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={[props.className?.replace("pl-4", ""), "pl-10 pr-10"].filter(Boolean).join(" ")}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--charcoal)] transition-colors"
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
      >
        {showPassword ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
