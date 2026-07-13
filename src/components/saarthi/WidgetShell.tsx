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
  className,
}: Props) {
  const toneCls =
    tone === "primary"
      ? "bg-gradient-to-br from-primary/10 to-brand-soft border-primary/20"
      : tone === "muted"
        ? "bg-muted/40 border-border/60"
        : "bg-card border-border/60";

  return (
    <section
      className={`rounded-2xl border ${toneCls} p-4 shadow-sm ${className ?? ""}`}
    >
      {(title || headerRight) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </section>
  );
}