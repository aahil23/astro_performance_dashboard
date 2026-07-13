import { HeroWidget } from "./widgets/HeroWidget";
import { FocusWidget } from "./widgets/FocusWidget";
import { EarningsWidget } from "./widgets/EarningsWidget";
import { PerformanceWidget } from "./widgets/PerformanceWidget";
import { LeaderboardWidget } from "./widgets/LeaderboardWidget";
import { RiskMeterWidget } from "./widgets/RiskMeterWidget";
import { PriorityJourneyWidget } from "./widgets/PriorityJourneyWidget";
import { HighlightWidget } from "./widgets/HighlightWidget";
import { MantraWidget } from "./widgets/MantraWidget";
import { SaarthiExpertProfileCard } from "./SaarthiExpertProfileCard";
import type {
  SaarthiData,
  SaarthiLayoutItem,
} from "@/types/saarthi";

interface Props {
  data: SaarthiData;
  phoneNumber?: string | null;
  onLogout: () => void;
}

export function SaarthiDashboard({
  data,
  phoneNumber,
  onLogout,
}: Props) {
  const layout:
    SaarthiLayoutItem[] =
      data.layout ?? [];

  return (
    <main className="mx-auto w-full max-w-[760px] space-y-5 px-4 pb-10 pt-5 sm:px-6">
      <SaarthiExpertProfileCard
        identity={data.identity}
        phoneNumber={phoneNumber}
        onLogout={onLogout}
      />

      <HeroWidget
        identity={data.identity}
        hero={data.hero}
      />

      {layout.map(
        (item, index) => (
          <WidgetRenderer
            key={`${item.id}-${index}`}
            item={item}
            data={data}
          />
        ),
      )}
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
          focus={data.focus}
          size={item.size}
        />
      ) : null;

    case "earnings":
      return data.earnings ? (
        <EarningsWidget
          earnings={data.earnings}
          size={item.size}
        />
      ) : null;

    case "performance":
      return data.performance ? (
        <PerformanceWidget
          performance={
            data.performance
          }
          size={item.size}
        />
      ) : null;

    case "leaderboard":
      return data.ranking ? (
        <LeaderboardWidget
          ranking={data.ranking}
          size={item.size}
        />
      ) : null;

    case "risk_meter":
      return data.risk ? (
        <RiskMeterWidget
          risk={data.risk}
          size={item.size}
        />
      ) : null;

    case "priority_journey":
      return data.journey ? (
        <PriorityJourneyWidget
          journey={data.journey}
          size={item.size}
        />
      ) : null;

    case "highlight":
      return data.highlight ? (
        <HighlightWidget
          highlight={
            data.highlight
          }
          size={item.size}
        />
      ) : null;

    case "mantra":
      return data.mantra ? (
        <MantraWidget
          mantra={data.mantra}
          size={item.size}
        />
      ) : null;

    default:
      if (import.meta.env.DEV) {
        console.warn(
          `[SaarthiDashboard] Unknown widget id: ${item.id}`,
        );
      }

      return null;
  }
}
