import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { SaarthiDashboard } from "@/components/saarthi/SaarthiDashboard";
import { saarthiStore } from "@/lib/saarthi-store";
import { session } from "@/lib/session";
import { dashboardStore } from "@/lib/dashboard-store";
import type { SaarthiData } from "@/types/saarthi";
import {
  endSession,
  hasLoggedSessionStarted,
  logAnalyticsEvent,
  markSessionStartedLogged,
  registerInactivityLogoutHandler,
  startSession,
} from "@/services/analytics";

export const Route = createFileRoute("/saarthi")({
  component: SaarthiPage,
});

function SaarthiPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<SaarthiData | null>(() => saarthiStore.get());

  useEffect(() => {
    if (!data) navigate({ to: "/" });
  }, [data, navigate]);

  useEffect(() => {
    registerInactivityLogoutHandler(() => {
      saarthiStore.clear();
      dashboardStore.clear();
      session.logout();
      setData(null);
      navigate({ to: "/" });
    });
  }, [navigate]);

  useEffect(() => {
    if (!data || hasLoggedSessionStarted()) return;
    const identity = data.identity;
    const sessionId = startSession({
      expert_id: String(identity.expertId),
      phone_number: session.get() ?? "",
    });
    void logAnalyticsEvent({
      event_name: "session_started",
      session_id: sessionId,
      expert_id: String(identity.expertId),
      phone_number: session.get() ?? "",
      metadata: {
        expert_name: identity.expertName,
        variant: identity.variant,
        current_priority: identity.currentPriority,
        next_priority: identity.nextPriority,
        dashboard_route: "saarthi",
      },
    });
    markSessionStartedLogged();
  }, [data]);

  const logout = () => {
    endSession("logout");
    saarthiStore.clear();
    dashboardStore.clear();
    session.logout();
    setData(null);
    navigate({ to: "/" });
  };

  if (!data) return null;

  return (
    <div className="min-h-screen">
      <AppHeader title="Saarthi" backTo="/" />
      <div className="mx-auto max-w-md px-4 pb-16 pt-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {data.identity.expertName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              ID {data.identity.expertId}
              {data.identity.variant ? ` · ${data.identity.variant}` : ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-brand-soft"
          >
            Logout
          </button>
        </div>
        <SaarthiDashboard data={data} />
      </div>
    </div>
  );
}