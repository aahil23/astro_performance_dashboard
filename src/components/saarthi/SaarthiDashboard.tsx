import { ExpertProfileCard } from "@/components/dashboard/ExpertProfileCard";
import type { ApiExpert } from "@/services/dashboardApi";
import type { SaarthiData, SaarthiLayoutItem } from "@/types/saarthi";
import { EarningsWidget } from "./widgets/EarningsWidget";
import { FocusWidget } from "./widgets/FocusWidget";
import { HeroWidget } from "./widgets/HeroWidget";
import { HighlightWidget } from "./widgets/HighlightWidget";
import { LeaderboardWidget } from "./widgets/LeaderboardWidget";
import { MantraWidget } from "./widgets/MantraWidget";
import { PerformanceWidget } from "./widgets/PerformanceWidget";
import { PriorityJourneyWidget } from "./widgets/PriorityJourneyWidget";
import { RiskMeterWidget } from "./widgets/RiskMeterWidget";

interface Props {
  data: SaarthiData;
  phoneNumber?: string | null;
  onLogout: () => void;
}

function buildProfileExpert(
  data: SaarthiData,
  phoneNumber?: string | null,
): ApiExpert {
  return {
    expert_id: String(data.identity.expertId),
    name: data.identity.expertName,
    phone_number: String(phoneNumber ?? ""),
    primary_language: data.identity.primaryLanguage,
    variant: data.identity.variant,
    current_priority: data.identity.currentPriority,
    next_priority: data.identity.nextPriority,
    dashboard_version: "saarthi_v1",
    dashboard_route: "saarthi",
  };
}

function getLastUpdated(metadata: SaarthiData["metadata"]): string | undefined {
  if (!metadata) return undefined;
  return typeof metadata.generatedAtIst === "string"
    ? metadata.generatedAtIst
    : undefined;
}

export function SaarthiDashboard({ data, phoneNumber, onLogout }: Props) {
  const layout: SaarthiLayoutItem[] = data.layout ?? [];
  const expert = buildProfileExpert(data, phoneNumber);
  const lastUpdated = getLastUpdated(data.metadata);

  return (
    <main className="mx-auto w-full max-w-[760px] space-y-4 px-4 pb-8 pt-4 sm:px-6">
      <ExpertProfileCard
        expert={expert}
        onLogout={onLogout}
        lastUpdated={lastUpdated}
      />

      <HeroWidget identity={data.identity} hero={data.hero} />

      {layout.map((item, index) => (
        <WidgetRenderer
          key={`${item.id}-${index}`}
          item={item}
          data={data}
        />
      ))}
    </main>
  );
}

function WidgetRenderer({
  item,
  data,
}: {
  item: SaarthiLayoutItem;
  data: SaarthiData;
}) {
  switch (item.id) {
    case "focus":
      return data.focus ? (
        <FocusWidget
          expertId={data.identity.expertId}
          focus={data.focus}
          size={item.size}
        />
      ) : null;

    case "earnings":
      return data.earnings ? (
        <EarningsWidget earnings={data.earnings} size={item.size} />
      ) : null;

    case "performance":
      return data.performance ? (
        <PerformanceWidget performance={data.performance} size={item.size} />
      ) : null;

    case "leaderboard":
      return data.ranking ? (
        <LeaderboardWidget ranking={data.ranking} size={item.size} />
      ) : null;

    case "risk_meter":
      return data.risk ? (
        <RiskMeterWidget risk={data.risk} size={item.size} />
      ) : null;

    case "priority_journey":
      return data.journey ? (
        <PriorityJourneyWidget
          journey={data.journey}
          currentPriority={data.identity.currentPriority}
        />
      ) : null;

    case "highlight":
      return data.highlight ? (
        <HighlightWidget highlight={data.highlight} />
      ) : null;

    case "mantra":
      return data.mantra ? <MantraWidget mantra={data.mantra} /> : null;

    default:
      if (import.meta.env.DEV) {
        console.warn(`[SaarthiDashboard] Unknown widget id: ${item.id}`);
      }
      return null;
  }
}
