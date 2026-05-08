import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.svg";

export const Route = createFileRoute("/loading")({
  component: LoadingScreen,
});

function LoadingScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);
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