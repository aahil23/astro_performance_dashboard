import { WidgetShell } from "../WidgetShell";
import type { SaarthiRisk } from "@/types/saarthi";

interface Props {
  risk?: SaarthiRisk | null;
  size?: "small" | "medium" | "large";
}

export function RiskMeterWidget({ risk }: Props) {
  if (!risk) return null;

  const state = normalizeState(risk.state);
  const current = formatSeconds(risk.currentValue);
  const safe = formatSeconds(risk.safeValue);

  return (
    <WidgetShell title="Priority Status" subtitle="Your current safety position">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-sm font-bold ${getStateClass(state)}`}>
              {formatState(state)}
            </p>
            <p className="mt-1 whitespace-pre-line text-xs leading-4 text-muted-foreground">
              {getStateMessage(state)}
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2">
            <Metric label="Current D3 Talktime" value={current} />
            <Metric label="Safe" value={safe} />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px] rounded-lg bg-background px-2.5 py-2 text-center">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold leading-none text-foreground">
        {value}
      </p>
    </div>
  );
}

function normalizeState(value: unknown): string {
  return String(value || "protected").trim().toLowerCase();
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
    protected: "You are above the safety benchmark.\nMaintain your P1 performance today.",
    watch: "Stay above your safety benchmark to keep P1.",
    needs_attention: "Improve your ATT today to protect your P1 position.",
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
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}
