const items = [
  { label: "Poor", color: "var(--status-poor)" },
  { label: "Average", color: "var(--status-average)" },
  { label: "Good", color: "var(--status-good)" },
  { label: "Excellent", color: "var(--status-excellent)" },
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: i.color }}
          />
          <span className="text-xs text-muted-foreground">{i.label}</span>
        </div>
      ))}
    </div>
  );
}