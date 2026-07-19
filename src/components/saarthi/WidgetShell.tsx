import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  tone?: "default" | "primary" | "muted";
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}

export function WidgetShell({
  title,
  subtitle,
  tone = "default",
  children,
  headerRight,
  className = "",
}: Props) {
  const toneClass =
    tone === "primary"
      ? "bg-gradient-to-br from-primary/10 to-brand-soft border-primary/20"
      : tone === "muted"
        ? "bg-muted/40 border-border/60"
        : "bg-card border-border/60";

  return (
    <section
      className={`rounded-2xl border p-4 shadow-sm ${toneClass} ${className}`}
    >
      {(title || subtitle || headerRight) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-base font-semibold leading-tight text-foreground">
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-xs leading-4 text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          {headerRight}
        </div>
      )}

      {children}
    </section>
  );
}
