import logo from "@/assets/logo.svg";
import type { SaarthiPersonalFeedback } from "@/types/saarthi";

interface Props {
  feedback: SaarthiPersonalFeedback;
}

function toBulletLines(markdown: string, fallback: string): string[] {
  const source = (markdown || "").trim() || (fallback || "").trim();
  return source
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function PersonalFeedbackWidget({ feedback }: Props) {
  const bullets = toBulletLines(feedback.markdown, feedback.text);

  return (
    <section className="rounded-3xl border border-primary/20 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
          <img src={logo} alt="AstroLokal" className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-primary">Personal Feedback</p>
      </div>

      <h2 className="mt-4 text-lg font-semibold leading-snug text-foreground">
        {feedback.title}
      </h2>

      <ul className="mt-3 space-y-2 pl-5 text-sm leading-5 text-foreground/90">
        {bullets.map((line, index) => (
          <li key={`${feedback.id}-${index}`} className="list-disc pl-1">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}