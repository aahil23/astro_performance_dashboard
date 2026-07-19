import { LogOut } from "lucide-react";
import logo from "@/assets/logo.svg";
import type { ApiExpert } from "@/services/dashboardApi";

interface Props {
  expert: ApiExpert;
  onLogout: () => void;
  lastUpdated?: string;
}

export function ExpertProfileCard({
  expert,
  onLogout,
  lastUpdated,
}: Props) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="AstroLokal" className="h-10 w-10 shrink-0" />

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-foreground">
              {expert.name}
            </h1>
            {expert.phone_number ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                +91 {expert.phone_number}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/50 pt-2.5 text-[11px] leading-4 text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
          Expert ID: {expert.expert_id}
        </span>

        {lastUpdated ? (
          <span className="text-right">
            Last updated: {lastUpdated} · Updates at 9:00 AM & 9:00 PM
          </span>
        ) : (
          <span>Updates at 9:00 AM & 9:00 PM daily</span>
        )}
      </div>
    </section>
  );
}
