import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import { session } from "@/lib/session";
import { dashboardStore } from "@/lib/dashboard-store";
import { fetchDashboardByPhone, fetchDashboardByUserId } from "@/services/dashboardApi";
import { fetchSaarthiIdentity, SaarthiApiError } from "@/services/saarthiApi";
import { saarthiStore } from "@/lib/saarthi-store";

export const Route = createFileRoute("/loading")({
  component: LoadingScreen,
});

function LoadingScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const identifier = session.get();
    const identifierType = session.getType();

    if (!identifier) {
      navigate({ to: "/" });
      return;
    }

    // Saarthi now owns identity resolution directly (its own login_creds
    // sheet) -- one call gets both dashboard_route and, when applicable,
    // the full dashboard payload. This replaces the old two-step flow
    // (v1 Login Sheet -> Saarthi) for the common case.
    fetchSaarthiIdentity(identifierType, identifier)
      .then((identity) => {
        if (!active) return;

        session.setPhoneNumber(identity.phoneNumber);

        if (identity.dashboardRoute === "saarthi" && identity.dashboard) {
          saarthiStore.set(identity.dashboard);
          navigate({ to: "/saarthi" });
          return;
        }

        // Fallback: expert's dashboard_route is still "dashboard" --
        // resolve via the v1 Login Sheet API as before.
        const fetchPromise =
          identifierType === "user_id"
            ? fetchDashboardByUserId(identifier)
            : fetchDashboardByPhone(identifier);

        return fetchPromise.then((data) => {
          if (!active) return;
          dashboardStore.set(data);
          navigate({ to: "/dashboard" });
        });
      })
      .catch((e: unknown) => {
        if (!active) return;
        const msg =
          e instanceof SaarthiApiError || e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.";
        setError(msg);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const tryAgain = () => {
    dashboardStore.clear();
    saarthiStore.clear();
    session.logout();
    navigate({ to: "/" });
  };

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <img src={logo} alt="" className="h-16 w-16 opacity-80" />
        <p className="mt-6 max-w-xs text-base font-medium text-foreground">{error}</p>
        <button
          onClick={tryAgain}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95"
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <img src={logo} alt="" className="h-20 w-20 animate-pulse" />
      </div>
      <p className="mt-6 max-w-xs text-base font-medium text-foreground">
        Stay calm, your performance dashboard is on its way.
      </p>
    </main>
  );
}
