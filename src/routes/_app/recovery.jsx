import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, Play, ShieldCheck } from "lucide-react";
import { Card, ErrorNote, PageHeader, PageSkeleton } from "@/components/app/States";
import ScoreRing from "@/components/app/ScoreRing";
import { BARRIERS, addDays, adaptAction, isoDate, lapseRisk, resilientScore } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";
import { createMany, createOne, updateOne } from "@/lib/store";

export const Route = createFileRoute("/_app/recovery")({
  validateSearch: (search) => ({ barrier: search.barrier }),
  head: () => ({ meta: [{ title: "Recovery — Bounce" }] }),
  component: RecoveryPage,
});

const BARRIER_COPY = {
  en: { no_time: "No time", tired: "Tired", pain: "Pain", travel: "Travelling", fasting: "Fasting", heat: "Heat", family: "Family duties", low_mood: "Low mood", forgot: "Forgot" },
  ar: { no_time: "لا وقت", tired: "متعب", pain: "ألم", travel: "مسافر", fasting: "صائم", heat: "الحرّ", family: "واجبات عائلة", low_mood: "مزاج منخفض", forgot: "نسيت" },
};

function RecoveryPage() {
  const acc = useAccount();
  const { t, lang } = usePrefs();
  const { barrier: preset } = Route.useSearch();
  const ar = lang === "ar";
  const [barrier, setBarrier] = useState(preset || null);
  const [applied, setApplied] = useState(null);
  const [busy, setBusy] = useState(false);
  const today = isoDate();

  if (acc.loading) return <PageSkeleton />;
  if (acc.error) return <ErrorNote error={acc.error} onRetry={acc.reload} retryLabel={t("common.tryAgain")} />;

  const risk = lapseRisk(acc.logs);
  const score = resilientScore(acc.logs);
  const openLapse = acc.lapses.find((l) => l.status === "open");
  const recovered = acc.lapses.filter((l) => l.status === "recovered");
  const avgRecovery = recovered.length ? (recovered.reduce((s, l) => s + (l.recovery_days || 0), 0) / recovered.length).toFixed(1) : null;

  const candidate =
    acc.actions
      .filter((a) => a.behavior !== "checkin" && a.date >= today && a.status === "planned")
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0] ||
    acc.actions.filter((a) => a.behavior !== "checkin")[0];

  const adapted = candidate && barrier ? adaptAction(candidate, barrier, lang, acc.goals.find((g) => g.behavior === candidate.behavior)) : null;

  const apply = async () => {
    if (!adapted || !candidate) return;
    setBusy(true);
    try {
      await updateOne("actions", candidate.id, {
        size: adapted.size, timing: adapted.timing, title: adapted.title, time: adapted.time, tone: adapted.tone, note: adapted.note, technique: adapted.technique,
      });
      if (!openLapse) {
        let start = today;
        for (let i = 1; i <= 7; i++) {
          const day = addDays(today, -i);
          const logged = acc.logs.some((l) => l.date === day && l.behavior !== "checkin" && l.outcome === "done");
          if (logged) break;
          start = day;
        }
        await createOne("lapses", { start_date: start, barrier, status: "open", risk_score: risk.score, adaptation: adapted.note });
      } else {
        await updateOne("lapses", openLapse.id, { barrier, risk_score: risk.score, adaptation: adapted.note });
      }
      setApplied(adapted);
      await acc.reload();
      toast.success(t("recovery.adapted"));
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const simulate = async () => {
    setBusy(true);
    try {
      const pattern = ["skipped", "skipped", "partial", "skipped", "done"];
      const rows = pattern.map((outcome, i) => ({
        date: addDays(today, -(i + 1)),
        behavior: candidate?.behavior || "movement",
        outcome,
        effort: outcome === "done" ? 3 : outcome === "partial" ? 4 : 5,
        barrier: outcome === "skipped" ? "tired" : null,
        size: "small",
        timing: "midday",
        tone: "direct",
        channel: "app",
        source: "simulation",
        note: "simulated rough week",
      }));
      await createMany("logs", rows);
      if (!openLapse) {
        await createOne("lapses", {
          start_date: addDays(today, -5),
          barrier: "tired",
          status: "open",
          risk_score: 0.72,
          adaptation: "A seeded demonstration lapse, for judging the recovery flow.",
        });
      }
      await acc.reload();
      toast.success(ar ? "أُضيف أسبوع صعب إلى البيانات التجريبية." : "A rough week was added to the demo data.");
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("recovery.title")}
        subtitle={t("recovery.intro")}
        action={
          <button
            type="button"
            onClick={simulate}
            disabled={busy}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11.5px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {t("recovery.simulate")}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("recovery.risk")}</p>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing value={Math.round(risk.score * 100)} size={112} label={t("recovery.risk")}>
              <div>
                <p className="display text-xl leading-none text-foreground">{Math.round(risk.score * 100)}%</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  {risk.band === "high" ? t("recovery.high") : risk.band === "medium" ? t("recovery.medium") : t("recovery.low")}
                </p>
              </div>
            </ScoreRing>
            <ul className="space-y-1.5 text-[11.5px] text-muted-foreground">
              <li>{ar ? "أيام فائتة (٧ أيام)" : "Missed days (7d)"}: <span className="text-foreground">{risk.missed}</span></li>
              <li>{ar ? "منذ آخر خطوة" : "Since last step"}: <span className="text-foreground">{risk.sinceDone} {t("common.days")}</span></li>
              <li>{t("recovery.kept")}: <span className="text-aqua">{score.score}/100</span></li>
            </ul>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            {ar
              ? "المؤشر يجمع الأيام الفائتة، والجهد المتصاعد، والتذكيرات المتجاهَلة. هو إشارة لتصغير الطلب — لا حكم."
              : "This combines missed days, rising effort and ignored nudges. It is a signal to shrink the ask — never a verdict."}
          </p>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("recovery.barrier")}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BARRIERS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => { setBarrier(b); setApplied(null); }}
                aria-pressed={barrier === b}
                className={`rounded-full border px-3 py-1.5 text-[11.5px] transition-colors ${barrier === b ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {BARRIER_COPY[lang]?.[b] || b}
              </button>
            ))}
          </div>

          {candidate ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">{t("recovery.before")}</p>
                <p className="mt-1 text-[12px] leading-snug text-foreground">{candidate.title}</p>
                <p className="mt-1 text-[10.5px] text-muted-foreground">{candidate.time} · {candidate.size}</p>
              </div>
              <ArrowRight className="mx-auto hidden h-4 w-4 text-muted-foreground sm:block rtl:rotate-180" />
              <div className={`rounded-xl border p-3 ${adapted ? "border-aqua/40 bg-aqua/[0.06]" : "border-dashed border-border"}`}>
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">{t("recovery.after")}</p>
                <p className="mt-1 text-[12px] leading-snug text-foreground">{adapted ? adapted.title : (ar ? "اختر عائقًا لترى التعديل" : "Pick a barrier to see the change")}</p>
                {adapted && <p className="mt-1 text-[10.5px] text-aqua/80">{adapted.time} · {adapted.size}</p>}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-[12px] text-muted-foreground">{ar ? "لا توجد خطوات قادمة بعد." : "No upcoming step to adapt yet."}</p>
          )}

          {adapted?.note && <p className="mt-3 text-[11.5px] leading-relaxed text-aqua/80">{adapted.note}</p>}

          <button
            type="button"
            onClick={apply}
            disabled={!adapted || busy}
            className="mt-5 w-full rounded-xl bg-sand py-3 text-[13px] font-medium text-[#06161c] disabled:opacity-50"
          >
            {applied ? t("recovery.adapted") : t("recovery.adapt")}
          </button>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aqua" />
            {ar ? "تقدّمك محفوظ. لا يُصفَّر شيء، ولا تُفقد أوسمة." : "Your progress is kept. Nothing is reset, and no badge is taken away."}
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("recovery.recoverDays")}</p>
          <p className="mt-2 font-heading text-2xl text-foreground">{avgRecovery ? `${avgRecovery} ${t("common.days")}` : "—"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{recovered.length} {ar ? "تعافٍ مسجّل" : "recoveries logged"}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{ar ? "التعافي خلال ٧ أيام" : "Recovered within 7 days"}</p>
          <p className="mt-2 font-heading text-2xl text-foreground">
            {recovered.length ? `${Math.round((recovered.filter((l) => (l.recovery_days || 0) <= 7).length / recovered.length) * 100)}%` : "—"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{ar ? "من كل تعثّر مسجّل" : "of every logged lapse"}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{ar ? "الأوسمة" : "Badges"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {acc.badges.length ? acc.badges.map((b) => (
              <span key={b.id} className="flex items-center gap-1 rounded-full border border-aqua/40 bg-aqua/10 px-2.5 py-1 text-[10.5px] text-aqua">
                <BadgeCheck className="h-3 w-3" /> {b.label}
              </span>
            )) : <span className="text-[11.5px] text-muted-foreground">{ar ? "يعود أول وسام مع أول عودة." : "Your first return earns the first badge."}</span>}
          </div>
        </Card>
      </div>

      <Card className="mt-4 bg-secondary/25">
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          {ar
            ? "كل تعديل يطبّق خريطة عوائق COM-B: قد تكون المشكلة في القدرة أو الفرصة أو الدافع — والخطة تتغيّر حسب أيها."
            : "Every adjustment applies COM-B barrier mapping: the missing piece may be capability, opportunity or motivation — and the plan changes to whichever it is."}
        </p>
        <Link to="/insights" className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-aqua">
          {t("insights.title")} <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </Card>
    </>
  );
}