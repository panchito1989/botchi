"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const TABS = [
  { seg: "", label: "Resumen" },
  { seg: "identity", label: "Identidad" },
  { seg: "retos", label: "Retos" },
  { seg: "progress", label: "Progreso" },
  { seg: "modules", label: "Módulos" },
];

export function BotchiNav({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/botchi/${id}`;

  return (
    <nav className="mb-7 flex gap-1 border-b border-line">
      {TABS.map((t) => {
        const href = t.seg ? `${base}/${t.seg}` : base;
        const active = pathname === href;
        return (
          <Link
            key={t.seg}
            href={href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition",
              active
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
