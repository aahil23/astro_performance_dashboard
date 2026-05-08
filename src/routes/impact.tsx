import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dashboard/AppHeader";

export const Route = createFileRoute("/impact")({
  component: ImpactPage,
});

function ImpactPage() {
  return (
    <div className="min-h-screen">
      <AppHeader title="Impact of Score" showHelp={false} backTo="/dashboard" />
      <div className="mx-auto max-w-md px-4 py-8">
        <h2 className="text-xl font-bold text-foreground">Impact of Score</h2>
        <p className="mt-2 text-sm text-muted-foreground">Content will be added later.</p>
      </div>
    </div>
  );
}