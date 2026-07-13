import { ArrowRight, Target } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiFocus, SaarthiFocusItem } from "@/types/saarthi";

interface Props {
  focus?: SaarthiFocus | null;
}

export function FocusWidget({ focus }: Props) {
  if (!focus?.primary && (!focus?.secondary || focus.secondary.length === 0)) {
    return null;
  }

  return (
    <WidgetShell
      title="Today's Focus"
      subtitle="What will move your priority forward"
      tone="primary"
    >
      {focus.primary && <PrimaryFocus item={focus.primary} />}
      {focus.secondary && focus.secondary.length > 0 && (
        <ul className="mt-3 space-y-2">
          {focus.secondary.map((item, i) => (
            <SecondaryFocus key={item.id ?? i} item={item} />
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

function PrimaryFocus({ item }: { item: SaarthiFocusItem }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          {item.title && (
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
          )}
          {item.body && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {item.body}
            </p>
          )}
          {(item.currentValue || item.targetValue) && (
            <p className="mt-2 text-xs text-foreground">
              <span className="text-muted-foreground">Now: </span>
              <span className="font-medium">{item.currentValue ?? "—"}</span>
              <span className="mx-1.5 text-muted-foreground">/</span>
              <span className="text-muted-foreground">Target: </span>
              <span className="font-medium">{item.targetValue ?? "—"}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SecondaryFocus({ item }: { item: SaarthiFocusItem }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        {item.title && (
          <p className="truncate text-xs font-medium text-foreground">
            {item.title}
          </p>
        )}
        {item.body && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {item.body}
          </p>
        )}
      </div>
      <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
    </li>
  );
}