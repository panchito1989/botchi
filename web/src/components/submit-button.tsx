"use client";

import { useFormStatus } from "react-dom";
import { buttonClass, cn } from "@/components/ui";

export function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonClass("primary", "md"), className)}
    >
      {pending ? "Procesando…" : children}
    </button>
  );
}
