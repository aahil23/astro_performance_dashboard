import { LogOut } from "lucide-react";
import logo from "@/assets/logo.svg";
import type { ApiExpert } from "@/services/dashboardApi";

interface Props {
  expert: ApiExpert;
  onLogout: () => void;
}

export function ExpertProfileCard({ expert, onLogout }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
          <img src={logo} alt="" className="h-10 w-10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">{expert.name}</p>
          <p className="truncate text-sm text-muted-foreground">+91 {expert.phone_number}</p>
          <p className="truncate text-xs text-muted-foreground">Expert ID: {expert.expert_id}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-medium text-primary hover:bg-brand-soft"
        >
          <LogOut className="mb-0.5 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
