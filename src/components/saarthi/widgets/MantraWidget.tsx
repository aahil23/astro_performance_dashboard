import { Quote } from "lucide-react";
import type { SaarthiMantra } from "@/types/saarthi";

interface Props {
  mantra?: SaarthiMantra | null;
}

export function MantraWidget({ mantra }: Props) {
  if (!mantra?.message) return null;
  return (
    <div className="rounded-2xl border border-primary/20 bg-brand-soft/60 p-4">
      <div className="flex items-start gap-3">
        <Quote className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          {mantra.title && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {mantra.title}
            </p>
          )}
          <p className="mt-1 text-sm italic leading-relaxed text-foreground">
            {mantra.message}
          </p>
        </div>
      </div>
    </div>
  );
}