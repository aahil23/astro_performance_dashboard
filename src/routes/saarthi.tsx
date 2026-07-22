import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/dashboard/AppHeader";
import { SaarthiDashboard } from "@/components/saarthi/SaarthiDashboard";
import { dashboardStore } from "@/lib/dashboard-store";
import { saarthiStore } from "@/lib/saarthi-store";
import { session } from "@/lib/session";
import {
  endSession,
  hasLoggedSessionStarted,
  logAnalyticsEvent,
  markSessionStartedLogged,
  registerInactivityLogoutHandler,
  startSession,
} from "@/services/analytics";
import type { SaarthiData } from "@/types/saarthi";

export const Route = createFileRoute("/saarthi")({
  component: SaarthiPage,
});

function SaarthiPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<SaarthiData | null>(() =>
    saarthiStore.get(),
  );

  useEffect(() => {
    if (!data) {
      navigate({ to: "/" });
    }
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
    if (!data || hasLoggedSessionStarted()) {
      return;
    }

    const identity = data.identity;
    const phoneNumber = session.get() ?? "";
    const sessionId = startSession({
      expert_id: String(identity.expertId),
      phone_number: phoneNumber,
    });

    void logAnalyticsEvent({
      event_name: "session_started",
      session_id: sessionId,
      expert_id: String(identity.expertId),
      phone_number: phoneNumber,
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

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF7F3]">
      <AppHeader
        title="Astro Performance Dashboard"
        onBack={() => navigate({ to: "/" })}
        showHelp
      />

      <SaarthiDashboard
        data={data}
        phoneNumber={session.get()}
        onLogout={logout}
      />
    </div>
  );
}
