import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { TECHNIQUES, TEXT } from "@/lib/content";

const DIM_LABEL = {
  size: { en: "action size", ar: "حجم الخطوة" },
  timing: { en: "time of day", ar: "وقت اليوم" },
  tone: { en: "tone", ar: "النبرة" },
  channel: { en: "channel", ar: "القناة" },
};

/**
 * "Why am I seeing this?" — the technique, its evidence and its limits, plus the
 * four adaptive choices that produced this specific card.
 */
export default function WhyPanel({ action, lang, t }) {
  const [open, setOpen] = useState(false);
  const tech = TECHNIQUES[action?.technique] || TECHNIQUES.self_monitoring;

  return (
    <div className="rounded-2xl border border-border/70 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
      >
        <span className="text-[13px] text-foreground">{t("common.why")}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-border/70 px-5 py-4 text-[12.5px] leading-relaxed text-muted-foreground">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-aqua/80">{t("common.technique")}</p>
            <p className="mt-1 text-foreground">{TEXT(tech.label, lang)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{t("common.evidence")}</p>
            <p className="mt-1">{TEXT(tech.evidence, lang)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{t("common.limits")}</p>
            <p className="mt-1">{TEXT(tech.limits, lang)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              {lang === "ar" ? "لماذا هذه الأربعة؟" : "Why these four choices?"}
            </p>
            <ul className="mt-2 space-y-1">
              {["size", "timing", "tone", "channel"].map((dim) => (
                <li key={dim} className="flex items-baseline justify-between gap-3">
                  <span>{TEXT(DIM_LABEL[dim], lang)}</span>
                  <span className="text-foreground">{action?.[dim]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground/80">
              {lang === "ar"
                ? "اختيرت هذه القيم باحتمال أعلى من الخيارات الأخرى، بناءً على نتائجك المسجلة — ثم تُختبر مرة أخرى كل يوم."
                : "These were sampled with a higher probability than the alternatives from your own logged outcomes — and are re-tested every day."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}