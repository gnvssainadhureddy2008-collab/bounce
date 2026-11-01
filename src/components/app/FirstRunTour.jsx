import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

const STEPS = [
  { key: "tour.step1", n: "01" },
  { key: "tour.step2", n: "02" },
  { key: "tour.step3", n: "03" },
];

/** First-run guided tour: three lines, dismissible, remembered per account. */
export default function FirstRunTour({ t, lang, onDone }) {
  const [i, setI] = useState(0);
  const last = i === STEPS.length - 1;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-sm rounded-2xl border border-aqua/25 bg-card/95 p-5 shadow-2xl backdrop-blur-xl lg:inset-x-auto lg:bottom-6 lg:end-6 lg:mx-0">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-aqua/70">
          {lang === "ar" ? "جولة سريعة" : "Quick tour"} · {STEPS[i].n}
        </span>
        <button type="button" onClick={onDone} aria-label={t("common.close")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-foreground">{t(STEPS[i].key)}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {STEPS.map((s, idx) => (
            <span key={s.n} className={`h-1 rounded-full transition-all ${idx === i ? "w-5 bg-aqua" : "w-1.5 bg-border"}`} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => (last ? onDone() : setI(i + 1))}
          className="flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-1.5 text-[12px] font-medium text-[#06161c]"
        >
          {last ? t("common.done") : t("common.next")}
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}