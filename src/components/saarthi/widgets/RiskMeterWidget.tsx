import { WidgetShell } from "../WidgetShell";
import type { SaarthiRisk } from "@/types/saarthi";

interface Props {
  risk?: SaarthiRisk | null;
  size?: "small" | "medium" | "large";
}

export function RiskMeterWidget({
  risk,
}: Props) {
  if (!risk) {
    return null;
  }

  const state = normalizeState(risk.state);
  const current = formatSeconds(risk.currentValue);
  const safe = formatSeconds(risk.safeValue);

  return (
    <WidgetShell
      title="Priority Status"
      subtitle="Your P1 safety benchmark"
    >
      <div className="rounded-xl border border-border/60 bg-background/70 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={[
                "text-xs font-semibold",
                getStateClass(state),
              ].join(" ")}
            >
              {formatState(state)}
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-foreground">
              {getStateMessage(state)}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          <Metric label="Current ATT" value={current} />
          <Metric label="Safe benchmark" value={safe} />
        </div>
      </div>
    </WidgetShell>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function normalizeState(value: unknown): string {
  return String(value || "protected")
    .trim()
    .toLowerCase();
}

function formatState(state: string): string {
  const labels: Record<string, string> = {
    protected: "Protected",
    watch: "Watch",
    needs_attention: "Needs attention",
  };

  return labels[state] || "Priority status";
}

function getStateMessage(state: string): string {
  const messages: Record<string, string> = {
    protected:
      "You are above the safety benchmark. Maintain your P1 performance today.",
    watch:
      "Stay above your safety benchmark to keep P1.",
    needs_attention:
      "Improve your ATT today to protect your P1 position.",
  };

  return messages[state] || messages.protected;
}

function getStateClass(state: string): string {
  const classes: Record<string, string> = {
    protected: "text-emerald-600",
    watch: "text-amber-600",
    needs_attention: "text-orange-600",
  };

  return classes[state] || "text-muted-foreground";
}

function formatSeconds(value: unknown): string {
  const numericValue = Number(value);

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(numericValue)
  ) {
    return "—";
  }

  const seconds = Math.max(0, Math.round(numericValue));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}
