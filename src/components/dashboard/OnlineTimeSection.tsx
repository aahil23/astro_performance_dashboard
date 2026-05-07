import type { Metric } from "@/lib/dashboard-data";
import { formatMetricValue } from "@/lib/dashboard-data";

interface Props {
  metrics: Metric[];
}

const groups = [
  { label: "Chat", busy: "chat_busy_time_l7", online: "chat_online_time_l7" },
  { label: "Audio", busy: "audio_busy_time_l7", online: "audio_online_time_l7" },
  { label: "Video", busy: "video_busy_time_l7", online: "video_online_time_l7" },
];

export function OnlineTimeSection({ metrics }: Props) {
  const get = (key: string) => metrics.find((m) => m.metric_key === key);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {groups.map((g, gi) => {
        const busy = get(g.busy);
        const online = get(g.online);
        return (
          <div key={g.label} className={gi !== groups.length - 1 ? "border-b border-border/60" : ""}>
            <div className="bg-muted/40 px-4 py-2 text-sm font-semibold text-foreground">{g.label}</div>
            <Row label="Busy Time" value={busy ? formatMetricValue(busy.score, busy.unit) : "N/A"} />
            <Row label="Online Time" value={online ? formatMetricValue(online.score, online.unit) : "N/A"} />
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 first:border-t-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}