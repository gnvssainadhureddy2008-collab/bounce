import { useState } from "react";
import { ChevronRight, Clock, Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BARRIERS } from "@/lib/engine";

const BARRIER_COPY = {
  en: {
    no_time: "No time", tired: "Tired", pain: "Pain", travel: "Travelling", fasting: "Fasting",
    heat: "Heat", family: "Family duties", low_mood: "Low mood", forgot: "Forgot",
  },
  ar: {
    no_time: "لا وقت", tired: "متعب", pain: "ألم", travel: "مسافر", fasting: "صائم",
    heat: "الحرّ", family: "واجبات عائلة", low_mood: "مزاج منخفض", forgot: "نسيت",
  },
};

const SIZE_LABEL = {
  micro: { en: "2-minute version", ar: "نسخة دقيقتين" },
  small: { en: "10-minute version", ar: "نسخة ١٠ دقائق" },
  medium: { en: "Longer version", ar: "نسخة أطول" },
};

/**
 * The whole product in one card: do it, make it smaller, or be honest.
 * The effort slider is the person's own reading — the engine never guesses it.
 */
export default function TinyActionCard({ action, lang, t, busy, onDone, onSmaller, onNotToday }) {
  const ar = lang === "ar";
  const [effort, setEffort] = useState(3);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [barrierOpen, setBarrierOpen] = useState(false);
  const [barrier, setBarrier] = useState(null);

  if (!action) return null;
  const done = action.status === "done";
  const skipped = action.status === "skipped";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-md sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-aqua/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-aqua/40 bg-aqua/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-aqua">
            {t("today.action")}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {action.time}
          </span>
          <span className="text-[11px] text-muted-foreground">· {SIZE_LABEL[action.size]?.[lang] || action.size}</span>
        </div>

        <h2 className="mt-4 font-heading text-xl font-medium leading-snug tracking-tight text-foreground sm:text-2xl">
          {action.title}
        </h2>
        {action.note && <p className="mt-2 text-[12px] leading-relaxed text-aqua/80">{action.note}</p>}

        {!done && !skipped && (
          <>
            <div className="mt-6">
              <label htmlFor="effort" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t("today.effort")}
              </label>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">{t("today.effortLow")}</span>
                <input
                  id="effort"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-[hsl(var(--aqua))]"
                  aria-valuetext={`${effort} / 5`}
                />
                <span className="text-[11px] text-muted-foreground">{t("today.effortHigh")}</span>
              </div>
            </div>

            {showNote ? (
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("today.note")}
                aria-label={t("today.note")}
                className="mt-4 w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13px] outline-none focus:border-aqua/50"
              />
            ) : (
              <button type="button" onClick={() => setShowNote(true)} className="mt-4 text-[12px] text-muted-foreground underline underline-offset-4 hover:text-foreground">
                {t("today.note")} ({t("common.optional")})
              </button>
            )}

            <div className="mt-6 grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr]">
              <button
                type="button"
                disabled={busy}
                onClick={() => onDone(effort, note)}
                className="flex items-center justify-center gap-2 rounded-xl bg-sand px-4 py-3 text-[13px] font-medium text-[#06161c] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {t("today.done")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onSmaller}
                className="rounded-xl border border-aqua/35 bg-aqua/[0.06] px-4 py-3 text-[13px] text-aqua transition-colors hover:bg-aqua/15 disabled:opacity-60"
              >
                {t("today.smaller")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setBarrierOpen(true)}
                className="rounded-xl border border-border px-4 py-3 text-[13px] text-muted-foreground transition-colors hover:border-sand/40 hover:text-foreground disabled:opacity-60"
              >
                {t("today.notToday")}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">{t("today.barrierPrompt")}</p>
          </>
        )}

        {done && (
          <div className="mt-6 rounded-xl border border-aqua/25 bg-aqua/[0.06] p-4">
            <p className="text-[13px] text-foreground">{t("today.allDone")}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("toast.logged")}</p>
          </div>
        )}

        {skipped && (
          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-[13px] text-foreground">{ar ? "سُجّل «ليس اليوم». تقدّمك كما هو." : "Logged as “not today”. Your progress is untouched."}</p>
            <a href="/recovery" className="mt-2 inline-flex items-center gap-1 text-[12px] text-aqua">
              {t("recovery.title")} <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </div>
        )}
      </div>

      <Dialog open={barrierOpen} onOpenChange={setBarrierOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-heading text-lg">{t("recovery.barrier")}</DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed text-muted-foreground">
            {t("recovery.intro")}
          </DialogDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            {BARRIERS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBarrier(b)}
                aria-pressed={barrier === b}
                className={`rounded-full border px-3.5 py-2 text-[12px] transition-colors ${
                  barrier === b ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {BARRIER_COPY[lang]?.[b] || b}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!barrier || busy}
            onClick={async () => { await onNotToday(barrier); setBarrierOpen(false); }}
            className="mt-5 w-full rounded-xl bg-sand py-3 text-[13px] font-medium text-[#06161c] disabled:opacity-50"
          >
            {t("recovery.adapt")}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}