import { Quote } from "lucide-react";
import type { SaarthiMantra } from "@/types/saarthi";

interface Props {
  mantra?: SaarthiMantra | null;
}

export function MantraWidget({ mantra }: Props) {
  if (!mantra?.message) return null;

  return (
    <section className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 shadow-sm">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <Quote className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        {mantra.title ? (
          <h3 className="text-sm font-semibold leading-tight text-foreground">
            {mantra.title}
          </h3>
        ) : null}
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          {mantra.message}
        </p>
      </div>
    </section>
  );
}
