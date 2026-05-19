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
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
          <img src={logo} alt="" className="h-10 w-10" />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-base font-semibold text-foreground">
            {expert.name}
          </p>

          <p className="truncate text-sm text-muted-foreground">
            +91 {expert.phone_number}
          </p>

          {lastUpdated && (
            <p
              className="mt-1 truncate text-[10px] leading-tight text-muted-foreground"
              title={`Last updated: ${lastUpdated}`}
            >
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-semibold text-primary">
            Expert ID: {expert.expert_id}
          </span>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-primary hover:bg-brand-soft"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
