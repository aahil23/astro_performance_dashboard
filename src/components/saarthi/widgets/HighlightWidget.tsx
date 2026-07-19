import { Sparkles } from "lucide-react";
import type { SaarthiHighlight } from "@/types/saarthi";

interface Props {
  highlight?: SaarthiHighlight | null;
}

export function HighlightWidget({ highlight }: Props) {
  if (!highlight?.message) return null;

  return (
    <section className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
      <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        {highlight.title ? (
          <h3 className="text-sm font-semibold leading-tight text-foreground">
            {highlight.title}
          </h3>
        ) : null}
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          {highlight.message}
        </p>
      </div>
    </section>
  );
}
