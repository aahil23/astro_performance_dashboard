const items = [
  { label: "Critical", color: "var(--status-critical)" },
  { label: "Stable", color: "var(--status-stable)" },
  { label: "Strong", color: "var(--status-strong)" },
  { label: "Elite", color: "var(--status-elite)" },
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