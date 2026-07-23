import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { ExpertProfileCard } from "@/components/dashboard/ExpertProfileCard";
import type { ApiExpert } from "@/services/dashboardApi";
import {
  trackCtaClick,
  trackInteraction,
  trackPersonalFeedbackPopupDismissed,
  trackPersonalFeedbackPopupShown,
  trackScrollDepth,
  trackWidgetSeen,
} from "@/services/analytics";
import {
  isPersonalFeedbackNew,
  markPersonalFeedbackSeen,
} from "@/lib/personalFeedback";
import type { SaarthiData, SaarthiLayoutItem } from "@/types/saarthi";
import { PersonalFeedbackPopup } from "./PersonalFeedbackPopup";
import { EarningsWidget } from "./widgets/EarningsWidget";
import { FocusWidget } from "./widgets/FocusWidget";
import { HeroWidget } from "./widgets/HeroWidget";
import { HighlightWidget } from "./widgets/HighlightWidget";
import { LeaderboardWidget } from "./widgets/LeaderboardWidget";
import { MantraWidget } from "./widgets/MantraWidget";
import { PerformanceWidget } from "./widgets/PerformanceWidget";
import { PersonalFeedbackWidget } from "./widgets/PersonalFeedbackWidget";
import { PriorityJourneyWidget } from "./widgets/PriorityJourneyWidget";
import { RiskMeterWidget } from "./widgets/RiskMeterWidget";

interface Props {
  data: SaarthiData;
  phoneNumber?: string | null;
  onLogout: () => void;
}

function buildProfileExpert(data: SaarthiData, phoneNumber?: string | null): ApiExpert {
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
  return typeof metadata.generatedAtIst === "string" ? metadata.generatedAtIst : undefined;
}

export function SaarthiDashboard({ data, phoneNumber, onLogout }: Props) {
  const layout: SaarthiLayoutItem[] = data.layout ?? [];
  const expert = buildProfileExpert(data, phoneNumber);
  const lastUpdated = getLastUpdated(data.metadata);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const feedbackHistoryEntryRef = useRef(false);
  const feedbackDismissedRef = useRef(false);

  const shouldShowInitialPopup = useMemo(() => {
    const feedback = data.personalFeedback;
    if (!feedback) return false;
    return isPersonalFeedbackNew(data.identity.expertId, feedback.version);
  }, [data.identity.expertId, data.personalFeedback]);

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(shouldShowInitialPopup);

  useEffect(() => {
    if (!showFeedbackPopup) return;

    trackPersonalFeedbackPopupShown();

    // Add a same-page history entry while the modal is open. This makes the
    // Android system Back button and the iOS Safari back gesture close the
    // popup first instead of leaving the dashboard.
    if (!feedbackHistoryEntryRef.current) {
      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          saarthiPersonalFeedbackPopup: true,
        },
        "",
        window.location.href,
      );
      feedbackHistoryEntryRef.current = true;
    }
  }, [showFeedbackPopup]);

  const completeFeedbackDismissal = useCallback(() => {
    if (feedbackDismissedRef.current) return;
    feedbackDismissedRef.current = true;

    const feedback = data.personalFeedback;
    if (feedback) {
      markPersonalFeedbackSeen(data.identity.expertId, feedback.version);
      trackPersonalFeedbackPopupDismissed();
    }

    feedbackHistoryEntryRef.current = false;
    setShowFeedbackPopup(false);
  }, [data.identity.expertId, data.personalFeedback]);

  useEffect(() => {
    if (!showFeedbackPopup) return;

    const onPopState = () => {
      // Fires for Android Back, browser Back, and iOS swipe-back. Since a
      // same-page entry was pushed above, this dismisses the popup without
      // navigating away from Saarthi.
      completeFeedbackDismissal();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [completeFeedbackDismissal, showFeedbackPopup]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
          const element = entry.target as HTMLElement;
          const widgetId = element.dataset.widgetId;
          const position = Number(element.dataset.widgetPosition ?? -1);
          if (widgetId) trackWidgetSeen(widgetId, position);
        });
      },
      { threshold: [0.35, 0.6] },
    );

    root.querySelectorAll<HTMLElement>("[data-widget-id]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [layout, data.personalFeedback]);

  useEffect(() => {
    const onScroll = () => {
      const documentElement = document.documentElement;
      const scrollable = documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable <= 0 ? 100 : (window.scrollY / scrollable) * 100;
      trackScrollDepth(depth);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismissFeedback = useCallback(() => {
    if (feedbackHistoryEntryRef.current) {
      // Cross, backdrop tap, and Escape consume the temporary modal history
      // entry. The popstate handler performs the actual dismissal once.
      window.history.back();
      return;
    }

    completeFeedbackDismissal();
  }, [completeFeedbackDismissal]);

  const onDashboardClickCapture = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const clickable = target.closest<HTMLElement>("button, a, [role='button']");
    if (!clickable) return;

    const widget = clickable.closest<HTMLElement>("[data-widget-id]");
    const label = clickable.getAttribute("aria-label") || clickable.textContent?.trim() || "interaction";
    const ctaTarget = clickable.dataset.ctaTarget || clickable.getAttribute("href") || "";

    trackInteraction();
    if (ctaTarget || clickable.dataset.analyticsCta === "true") {
      trackCtaClick({
        label,
        target: ctaTarget || label,
        widgetId: widget?.dataset.widgetId,
      });
    }
  }, []);

  return (
    <div ref={rootRef} onClickCapture={onDashboardClickCapture} className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-[760px] space-y-4 px-4 pb-8 pt-4 sm:px-6">
        <ExpertProfileCard expert={expert} onLogout={onLogout} lastUpdated={lastUpdated} />

        {data.hero ? (
          <div data-widget-id="hero" data-widget-position="0">
            <HeroWidget identity={data.identity} hero={data.hero} />
          </div>
        ) : null}

        {layout.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            data-widget-id={item.id}
            data-widget-position={index + 1}
            data-widget-size={item.size ?? ""}
          >
            <WidgetRenderer item={item} data={data} />
          </div>
        ))}
      </main>

      {showFeedbackPopup && data.personalFeedback ? (
        <PersonalFeedbackPopup feedback={data.personalFeedback} onDismiss={dismissFeedback} />
      ) : null}
    </div>
  );
}

function WidgetRenderer({ item, data }: { item: SaarthiLayoutItem; data: SaarthiData }) {
  switch (item.id) {
    case "focus":
      return data.focus ? <FocusWidget expertId={data.identity.expertId} focus={data.focus} size={item.size} /> : null;
    case "personal_feedback":
      return data.personalFeedback ? <PersonalFeedbackWidget feedback={data.personalFeedback} /> : null;
    case "earnings":
      return data.earnings ? <EarningsWidget earnings={data.earnings} size={item.size} /> : null;
    case "performance":
      return data.performance ? <PerformanceWidget performance={data.performance} size={item.size} /> : null;
    case "leaderboard":
      return data.ranking ? <LeaderboardWidget ranking={data.ranking} size={item.size} /> : null;
    case "risk_meter":
      return data.risk ? <RiskMeterWidget risk={data.risk} size={item.size} /> : null;
    case "priority_journey":
      return data.journey ? <PriorityJourneyWidget journey={data.journey} currentPriority={data.identity.currentPriority} /> : null;
    case "highlight":
      return data.highlight ? <HighlightWidget highlight={data.highlight} /> : null;
    case "mantra":
      return data.mantra ? <MantraWidget mantra={data.mantra} /> : null;
    default:
      if (import.meta.env.DEV) console.warn(`[SaarthiDashboard] Unknown widget id: ${item.id}`);
      return null;
  }
}
