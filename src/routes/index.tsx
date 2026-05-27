import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone } from "lucide-react";
import logo from "@/assets/logo.svg";
import { session } from "@/lib/session";
import { dashboardStore } from "@/lib/dashboard-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state as { message?: string } | undefined;
  const sessionMessage = routeState?.message;

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setBusy(true);
    dashboardStore.clear();
    session.login(phone);
    navigate({ to: "/loading" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {sessionMessage && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm">
            {sessionMessage}
          </div>
        )}

        <div className="rounded-3xl bg-card p-7 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <img
              src={logo}
              alt="Astro Performance Dashboard"
              className="h-16 w-16"
            />

            <h1 className="mt-3 bg-transparent text-2xl font-extrabold tracking-tight text-foreground">
              Astro Performance Dashboard
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your registered mobile number
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="mobile"
                className="text-sm font-medium text-foreground"
              >
                Mobile number
              </label>

              <div className="mt-1.5 flex items-center gap-2 rounded-xl border-2 border-solid border-[#f55824] bg-[#feece7] px-3 shadow-none focus-within:ring-2 focus-within:ring-ring">
                <Phone className="h-4 w-4 text-muted-foreground" />

                <input
                  id="mobile"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit number"
                  className="h-11 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition hover:opacity-95 disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
