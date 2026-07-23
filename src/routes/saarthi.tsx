import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { SaarthiDashboard } from "@/components/saarthi/SaarthiDashboard";
import { isPersonalFeedbackNew } from "@/lib/personalFeedback";
import { dashboardStore } from "@/lib/dashboard-store";
import { saarthiStore } from "@/lib/saarthi-store";
import { session } from "@/lib/session";
import {
  endSession,
  hasLoggedSessionStarted,
  logAnalyticsEvent,
  markSessionStartedLogged,
  registerInactivityLogoutHandler,
  setPersonalFeedbackAnalytics,
  startSession,
} from "@/services/analytics";
import type { SaarthiData } from "@/types/saarthi";

export const Route = createFileRoute("/saarthi")({ component: SaarthiPage });

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
    if (!data) return;

    const identity = data.identity;
    const phoneNumber = session.get() ?? "";
    const feedback = data.personalFeedback;
    const feedbackIsNew = feedback
      ? isPersonalFeedbackNew(identity.expertId, feedback.version)
      : false;

    setPersonalFeedbackAnalytics({
      available: Boolean(feedback),
      version: feedback?.version ?? null,
      isNew: feedbackIsNew,
    });

    // Always restore the browser-side session lifecycle on page load or refresh.
    // The session_started event itself is still sent only once per session.
    const sessionId = startSession({
      expert_id: String(identity.expertId),
      phone_number: phoneNumber,
      variant: identity.variant,
      dashboard_version: "saarthi_v1",
      current_priority: identity.currentPriority,
      primary_focus: data.focus?.primary?.type,
    });

    if (hasLoggedSessionStarted()) return;

    void logAnalyticsEvent({
      event_name: "session_started",
      session_id: sessionId,
      expert_id: String(identity.expertId),
      variant: identity.variant,
      dashboard_version: "saarthi_v1",
      current_priority: identity.currentPriority,
      metadata: {
        expert_name: identity.expertName,
        next_priority: identity.nextPriority,
        dashboard_route: "saarthi",
        primary_focus: data.focus?.primary?.type ?? "",
        personal_feedback: {
          available: Boolean(feedback),
          version: feedback?.version ?? null,
          is_new: feedbackIsNew,
        },
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
    <>
      <AppHeader onBack={() => navigate({ to: "/" })} showHelp />
      <SaarthiDashboard data={data} phoneNumber={session.get()} onLogout={logout} />
    </>
  );
}
