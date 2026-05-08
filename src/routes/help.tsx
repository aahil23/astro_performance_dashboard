import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dashboard/AppHeader";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="min-h-screen">
      <AppHeader title="Help" showHelp={false} backTo="/dashboard" />
      <div className="mx-auto max-w-md px-4 py-8">
        <h2 className="text-xl font-bold text-foreground">Help</h2>
        <p className="mt-2 text-sm text-muted-foreground">Help content will be added later.</p>
      </div>
    </div>
  );
}