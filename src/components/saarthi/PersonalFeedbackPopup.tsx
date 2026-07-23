import { useEffect } from "react";
import { X } from "lucide-react";

import logo from "@/assets/logo.svg";
import type { SaarthiPersonalFeedback } from "@/types/saarthi";

interface Props {
  feedback: SaarthiPersonalFeedback;
  onDismiss: () => void;
}

function toBulletLines(markdown: string, fallback: string): string[] {
  const source = markdown.trim() || fallback.trim();

  return source
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function PersonalFeedbackPopup({ feedback, onDismiss }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  const bullets = toBulletLines(feedback.markdown, feedback.text);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={onDismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="personal-feedback-title"
        className="relative w-full max-w-sm rounded-3xl border border-primary/20 bg-gradient-to-b from-white to-brand-soft p-5 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close personal feedback"
          className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground transition hover:bg-brand-soft hover:text-primary"
          onClick={onDismiss}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70">
            <img src={logo} alt="AstroLokal" className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold leading-tight text-primary">
            Personal Feedback
          </p>
        </div>

        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          Here's some personalised feedback to help you improve today.
        </p>

        <h2
          id="personal-feedback-title"
          className="mt-3 text-lg font-semibold leading-snug text-foreground"
        >
          {feedback.title}
        </h2>

        <ul className="mt-3 space-y-2 pl-5 text-sm leading-5 text-foreground/90">
          {bullets.map((line, index) => (
            <li key={`${feedback.id}-popup-${index}`} className="list-disc pl-1">
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
