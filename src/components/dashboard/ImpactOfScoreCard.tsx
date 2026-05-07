import { X } from "lucide-react";

interface Props {
  onDismiss: () => void;
}

export function ImpactOfScoreCard({ onDismiss }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-brand-soft-strong p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Impact of Score</h3>
              <button
                onClick={onDismiss}
                aria-label="Dismiss"
                className="rounded-full p-1 text-foreground/70 hover:bg-white/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-foreground/80">
              Better scores can help improve visibility and increase future opportunities.
            </p>
            <button className="mt-3 rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              Know More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}