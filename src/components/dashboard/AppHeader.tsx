import { ArrowLeft, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

interface Props {
  title: string;
  onBack?: () => void;
  showHelp?: boolean;
  backTo?: string;
}

export function AppHeader({ title, onBack, showHelp = true, backTo }: Props) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) return onBack();
    if (backTo) navigate({ to: backTo });
    else window.history.back();
  };
  return (
    <header className="sticky top-0 z-30 w-full bg-brand-soft-strong">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-white/40"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {showHelp ? (
          <Link
            to="/help"
            aria-label="Help"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-white/40"
          >
            <HelpCircle className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-9 w-9" />
        )}
      </div>
    </header>
  );
}