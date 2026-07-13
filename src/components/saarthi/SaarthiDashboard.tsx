import { HeroWidget } from "./widgets/HeroWidget";
import { FocusWidget } from "./widgets/FocusWidget";
import { EarningsWidget } from "./widgets/EarningsWidget";
import { PerformanceWidget } from "./widgets/PerformanceWidget";
import { LeaderboardWidget } from "./widgets/LeaderboardWidget";
import { RiskMeterWidget } from "./widgets/RiskMeterWidget";
import { PriorityJourneyWidget } from "./widgets/PriorityJourneyWidget";
import { HighlightWidget } from "./widgets/HighlightWidget";
import { MantraWidget } from "./widgets/MantraWidget";
import type { SaarthiData, SaarthiLayoutItem } from "@/types/saarthi";

interface Props {
  data: SaarthiData;
}

export function SaarthiDashboard({ data }: Props) {
  const layout: SaarthiLayoutItem[] = data.layout ?? [];

  return (
    <div className="space-y-4">
      <HeroWidget identity={data.identity} hero={data.hero} />
      {layout.map((item, i) => (
        <WidgetRenderer key={`${item.id}-${i}`} item={item} data={data} />
      ))}
    </div>
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
      return <FocusWidget focus={data.focus} />;
    case "earnings":
      return <EarningsWidget earnings={data.earnings} />;
    case "performance":
      return <PerformanceWidget performance={data.performance} />;
    case "leaderboard":
      return <LeaderboardWidget ranking={data.ranking} />;
    case "risk_meter":
      return <RiskMeterWidget risk={data.risk} />;
    case "priority_journey":
      return <PriorityJourneyWidget journey={data.journey} />;
    case "highlight":
      return <HighlightWidget highlight={data.highlight} />;
    case "mantra":
      return <MantraWidget mantra={data.mantra} />;
    default:
      return null;
  }
}