import { Sparkles } from "lucide-react";
import type { SaarthiHighlight } from "@/types/saarthi";

interface Props {
  highlight?: SaarthiHighlight | null;
}

export function HighlightWidget({ highlight }: Props) {
  if (!highlight?.message) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-status-strong/30 bg-status-strong/5 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-strong/15 text-status-strong">
        <Sparkles className="h-4 w-4" />
      </div>
      <div>
        {highlight.title && (
          <p className="text-sm font-semibold text-foreground">
            {highlight.title}
          </p>
        )}
        <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
          {highlight.message}
        </p>
      </div>
    </div>
  );
}