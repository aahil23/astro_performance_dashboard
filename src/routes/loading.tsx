import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.svg";
import { session } from "@/lib/session";
import { dashboardStore } from "@/lib/dashboard-store";
import { fetchDashboardByPhone } from "@/services/dashboardApi";

export const Route = createFileRoute("/loading")({
  component: LoadingScreen,
});

function LoadingScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const phone = session.get();
    if (!phone) {
      navigate({ to: "/" });
      return;
    }
    fetchDashboardByPhone(phone)
      .then((data) => {
        if (!active) return;
        dashboardStore.set(data);
        navigate({ to: "/dashboard" });
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message || "Something went wrong. Please try again.");
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const tryAgain = () => {
    dashboardStore.clear();
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
        <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 animate-spin text-primary" />
      </div>
      <p className="mt-6 max-w-xs text-base font-medium text-foreground">
        Stay calm, your performance dashboard is on its way.
      </p>
    </main>
  );
}