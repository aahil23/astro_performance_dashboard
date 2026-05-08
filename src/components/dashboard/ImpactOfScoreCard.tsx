import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ImpactOfScoreCard() {
  const [expanded, setExpanded] = useState(true);
  const contentId = "impact-of-score-content";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl bg-brand-soft-strong shadow-lg transition-all duration-300">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <h3 className="text-base font-bold text-foreground">Impact of Score</h3>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/40"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </span>
        </button>
        <div
          id={contentId}
          className={`grid transition-all duration-300 ease-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4">
              <p className="text-xs text-foreground/80">
                Better scores can help improve visibility and increase future opportunities.
              </p>
              <button className="mt-3 rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                Know More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}