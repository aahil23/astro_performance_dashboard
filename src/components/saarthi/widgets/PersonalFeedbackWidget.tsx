import logo from "@/assets/logo.svg";
import type { SaarthiPersonalFeedback } from "@/types/saarthi";
import { WidgetShell } from "../WidgetShell";

interface Props {
  feedback: SaarthiPersonalFeedback;
}

function toBulletLines(markdown: string, fallback: string): string[] {
  const source = markdown.trim() || fallback.trim();
  return source
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function PersonalFeedbackWidget({ feedback }: Props) {
  const bullets = toBulletLines(feedback.markdown, feedback.text);

  return (
    <WidgetShell tone="primary" className="overflow-hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
          <img src={logo} alt="AstroLokal" className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-primary">Personal Feedback</p>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
        {feedback.title}
      </h3>

      <ul className="mt-2 space-y-1.5 pl-4 text-sm leading-5 text-foreground/85">
        {bullets.map((line, index) => (
          <li key={`${feedback.id}-${index}`} className="list-disc pl-1">
            {line}
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
