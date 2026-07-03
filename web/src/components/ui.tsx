import Link from "next/link";
import type { ComponentProps } from "react";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------------- Logo ---------------- */

export function Logo({
  className = "",
  size = "md",
  tagline = false,
}: {
  className?: string;
  size?: "md" | "lg";
  tagline?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex flex-col", className)}>
      <span
        className={cn(
          "inline-flex items-baseline font-extrabold tracking-tight text-ink",
          size === "lg" ? "text-4xl" : "text-[22px]"
        )}
      >
        botchi
        <span
          className={cn(
            "ml-1 self-end rounded-full bg-brand",
            size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"
          )}
        />
      </span>
      {tagline && (
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Tu mentor evolutivo <span className="text-brand">con IA</span>
        </span>
      )}
    </Link>
  );
}

/* ---------------- Buttons ---------------- */

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-strong shadow-sm",
  cta: "bg-gradient-to-r from-brand to-emerald-400 text-white hover:opacity-95 shadow-md shadow-brand/20",
  secondary: "border border-line bg-white text-ink hover:bg-canvas",
  ghost: "text-muted hover:text-ink hover:bg-canvas",
};

const sizes = {
  md: "px-5 py-2.5",
  lg: "px-6 py-3 text-[15px]",
  sm: "px-3.5 py-2 text-[13px]",
};

export function buttonClass(
  variant: keyof typeof variants = "primary",
  size: keyof typeof sizes = "md"
) {
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button className={cn(buttonClass(variant, size), className)} {...props} />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

/* ---------------- Form field ---------------- */

export function Field({
  label,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </span>
      <input
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </span>
      <select
        className="w-full appearance-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

/* ---------------- Card ---------------- */

export function Card({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white",
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Line icons ---------------- */

const PATHS: Record<string, React.ReactNode> = {
  adaptive: (
    <path d="M12 3a4 4 0 0 0-4 4 4 4 0 0 0-1 7.9V18a3 3 0 0 0 6 0V3Zm0 0a4 4 0 0 1 4 4 4 4 0 0 1 1 7.9V18a3 3 0 0 1-6 0" />
  ),
  game: (
    <>
      <path d="M6 12h4M8 10v4" />
      <circle cx="15.5" cy="11.5" r=".6" fill="currentColor" />
      <circle cx="17.5" cy="13.5" r=".6" fill="currentColor" />
      <rect x="2.5" y="7" width="19" height="10" rx="5" />
    </>
  ),
  growth: <path d="M4 17l5-5 3 3 7-7m0 0h-4m4 0v4" />,
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3Z" />
    </>
  ),
  display: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M9 21h6M12 17v4" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z" />,
  battery: (
    <>
      <rect x="3" y="8" width="15" height="8" rx="2" />
      <path d="M21 11v2" />
      <path d="M7 12h4" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0" />
      <circle cx="12" cy="18.5" r="1" fill="currentColor" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3" />
    </>
  ),
  cloud: (
    <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 3.5 3.5 0 0 1 17.5 18H7Z" />
  ),
  refresh: (
    <path d="M4 9a8 8 0 0 1 13-3l3 3m0-4v4h-4M20 15a8 8 0 0 1-13 3l-3-3m0 4v-4h4" />
  ),
  check: <path d="M5 12l4 4 10-10" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M19 12H5m6 6-6-6 6-6" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  logout: <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M9 12h12m0 0-3-3m3 3-3 3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chart: <path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" />,
  language: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15 0 18M12 3c-2.5 2.7-2.5 15 0 18" />
    </>
  ),
  code: <path d="M9 8l-4 4 4 4m6-8 4 4-4 4" />,
  flask: <path d="M9 3h6M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 18l-5-9V3M7.5 14h9" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h2a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="11" r="1" fill="currentColor" />
    </>
  ),
  heart: <path d="M12 20s-7-4.3-9-8.5C1.5 8 3.5 5 7 5c2 0 3.3 1.2 5 3 1.7-1.8 3-3 5-3 3.5 0 5.5 3 4 6.5C19 15.7 12 20 12 20Z" />,
  noads: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 4l16 16" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.75,
}: {
  name: keyof typeof PATHS;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
