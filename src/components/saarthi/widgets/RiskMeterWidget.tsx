import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiRisk } from "@/types/saarthi";

interface Props {
  risk?: SaarthiRisk | null;
}

export function RiskMeterWidget({ risk }: Props) {
  if (!risk?.state) return null;

  const state = String(risk.state);
  const meta =
    state === "protected"
      ? {
          icon: ShieldCheck,
          label: "Protected",
          cls: "bg-status-strong/10 text-status-strong border-status-strong/30",
        }
      : state === "watch"
        ? {
            icon: ShieldAlert,
            label: "Watch",
            cls: "bg-status-stable/10 text-status-stable border-status-stable/30",
          }
        : {
            icon: AlertTriangle,
            label: "Needs attention",
            cls: "bg-status-critical/10 text-status-critical border-status-critical/30",
          };

  const Icon = meta.icon;

  return (
    <WidgetShell title={risk.title ?? "Priority Risk"}>
      <div className={`flex items-start gap-3 rounded-xl border p-3 ${meta.cls}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{meta.label}</p>
          {risk.message && (
            <p className="mt-1 text-xs leading-relaxed text-foreground/80">
              {risk.message}
            </p>
          )}
          {(risk.currentValue || risk.safeValue) && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Now {risk.currentValue ?? "—"} · Safe {risk.safeValue ?? "—"}
            </p>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}