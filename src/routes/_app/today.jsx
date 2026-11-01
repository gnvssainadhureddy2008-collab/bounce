import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Checkin from "@/components/app/Checkin";
import FirstRunTour from "@/components/app/FirstRunTour";
import ScoreRing from "@/components/app/ScoreRing";
import TinyActionCard from "@/components/app/TinyActionCard";
import WhyPanel from "@/components/app/WhyPanel";
import { Card, EmptyState, ErrorNote, PageHeader, PageSkeleton } from "@/components/app/States";
import { logOutcome } from "@/lib/actions";
import { adaptAction, composeAction, isoDate, lapseRisk, resilientScore, statsMap, addDays } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";
import { createOne, saveSettings, updateOne } from "@/lib/store";

export const Route = createFileRoute("/_app/today")({
  head: () => ({ meta: [{ title: "Today — Bounce" }] }),
  component: TodayPage,
});

function TodayPage() {
  const acc = useAccount();
  const { t, lang } = usePrefs();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const creatingRef = useRef(false);
  const failedRef = useRef(false);
  const today = isoDate();

  // first-time visitors are sent to onboarding
  useEffect(() => {
    if (!acc.loading && acc.settings && !acc.settings.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [acc.loading, acc.settings, navigate]);

  // make sure today always has an action
  const hasToday = acc.actions.some((a) => a.date === today);
  useEffect(() => {
    if (acc.loading || !acc.settings?.onboarded || !acc.goals.length) return;
    if (hasToday || creatingRef.current || failedRef.current) return;
    const goal = acc.goals.find((g) => g.status === "active") || acc.goals[0];
    creatingRef.current = true;
    const action = composeAction({
      goal,
      map: statsMap(acc.stats),
      lang,
      accessibility: { mobility: !!acc.settings?.mobility },
    });
    createOne("actions", { ...action, date: today })
      .then(() => acc.reload())
      .catch(() => { failedRef.current = true; })
      .finally(() => { creatingRef.current = false; });
  }, [acc.loading, acc.settings, hasToday, acc.goals, lang, today]);

  if (acc.loading) return <PageSkeleton />;
  if (acc.error) return <ErrorNote error={acc.error} onRetry={acc.reload} retryLabel={t("common.tryAgain")} />;
  if (!acc.goals.length) {
    return (
      <>
        <PageHeader title={t("today.title")} subtitle={t("today.subtitle")} />
        <EmptyState
          title={t("today.empty")}
          action={<Link to="/onboarding" className="rounded-full bg-sand px-5 py-2.5 text-[13px] font-medium text-[#06161c]">{t("today.build")}</Link>}
        />
      </>
    );
  }

  const action = acc.actions.find((a) => a.date === today) || acc.actions[0];
  const goal = acc.goals.find((g) => g.behavior === action?.behavior) || acc.goals[0];
  const score = resilientScore(acc.logs);
  const risk = lapseRisk(acc.logs);
  const upcoming = acc.actions
    .filter((a) => a.date > today && a.status === "planned")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);
  const checkinLog = acc.logs.find((l) => l.date === today && l.behavior === "checkin");

  const handleDone = async (effort, note) => {
    setBusy(true);
    try {
      await logOutcome({ action, outcome: "done", effort, note, stats: acc.stats, lapses: acc.lapses, badges: acc.badges });
      toast.success(t("toast.logged"));
      await acc.reload();
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleSmaller = async () => {
    setBusy(true);
    try {
      const next = adaptAction(action, "no_time", lang, goal);
      await updateOne("actions", action.id, { size: next.size, title: next.title, note: next.note, tone: next.tone, time: next.time });
      toast.success(lang === "ar" ? "صُغّر الطلب. تقدّمك محفوظ." : "Made smaller. Your progress is kept.");
      await acc.reload();
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleNotToday = async (barrier) => {
    setBusy(true);
    try {
      await logOutcome({ action, outcome: "skipped", barrier, stats: acc.stats, lapses: acc.lapses, badges: acc.badges });
      const tomorrow = addDays(today, 1);
      const adapted = adaptAction(action, barrier, lang, goal);
      const existing = acc.actions.find((a) => a.date === tomorrow);
      if (existing) {
        await updateOne("actions", existing.id, { size: adapted.size, title: adapted.title, note: adapted.note, tone: adapted.tone, time: adapted.time, timing: adapted.timing });
      } else {
        await createOne("actions", { ...adapted, date: tomorrow, status: "planned" });
      }
      toast.success(lang === "ar" ? "تكيّفت الخطة غدًا." : "Tomorrow's plan adapted.");
      await acc.reload();
      if (risk.band === "high") navigate({ to: "/recovery", search: { barrier } });
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const saveCheckin = async ({ mood, energy }) => {
    await createOne("logs", { date: today, behavior: "checkin", outcome: "partial", mood, energy, source: "live" });
    await acc.reload();
  };

  const finishTour = async () => {
    await saveSettings({ tour_done: true }, acc.settings);
    await acc.reload();
  };

  const riskCopy = risk.band === "high" ? t("recovery.high") : risk.band === "medium" ? t("recovery.medium") : t("recovery.low");

  return (
    <>
      <PageHeader
        title={t("today.title")}
        subtitle={t("today.subtitle")}
        action={
          <p className="text-[12px] text-muted-foreground">
            {t("app.greeting")}{acc.user?.full_name ? `, ${acc.user.full_name.split(" ")[0]}` : ""}
          </p>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <TinyActionCard
            action={action}
            lang={lang}
            t={t}
            busy={busy}
            onDone={handleDone}
            onSmaller={handleSmaller}
            onNotToday={handleNotToday}
          />
          <WhyPanel action={action} lang={lang} t={t} />

          {risk.band !== "low" && (
            <Card className="border-amber/30 bg-amber/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber/80">{t("recovery.risk")} · {riskCopy}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    {lang === "ar"
                      ? "لاحظنا نمطًا — أيام فائتة أو جهد متصاعد. لنصغّر الطلب قبل أن يتحول إلى ترك."
                      : "A pattern is showing — missed days or rising effort. Let us shrink the ask before it becomes a stop."}
                  </p>
                </div>
                <Link to="/recovery" className="rounded-full border border-amber/40 px-3.5 py-2 text-[12px] text-amber">
                  {t("recovery.title")}
                </Link>
              </div>
            </Card>
          )}

          {upcoming.length > 0 && (
            <Card>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("today.nextUp")}</p>
              <ul className="mt-3 divide-y divide-border/60">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-foreground">{a.title}</span>
                      <span className="text-[11px] text-muted-foreground">{a.date} · {a.time}</span>
                    </span>
                    <Link to="/plan" className="shrink-0 text-[11px] text-aqua">{t("plan.reschedule")}</Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("today.score")}</p>
            <div className="mt-4 flex items-center gap-5">
              <ScoreRing value={score.score} size={120} label={t("today.score")}>
                <div>
                  <p className="display text-2xl leading-none text-foreground">{score.score}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">/ 100</p>
                </div>
              </ScoreRing>
              <div className="space-y-2 text-[11.5px] text-muted-foreground">
                <p>{t("today.grace")}: <span className="text-foreground">{score.graceUsed}/{score.graceAllowance}</span></p>
                <p>{lang === "ar" ? "أيام فيها حركة" : "Days with action"}: <span className="text-foreground">{score.doneDays}</span></p>
                <p className="leading-relaxed text-muted-foreground/80">
                  {lang === "ar" ? "نافذة ٢٨ يومًا. لا تصفير." : "A 28-day window. Never resets."}
                </p>
              </div>
            </div>
          </Card>

          <Checkin lang={lang} t={t} initial={checkinLog} onSave={saveCheckin} />

          <Card className="bg-secondary/30">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("recovery.risk")}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${risk.band === "high" ? "bg-coral" : risk.band === "medium" ? "bg-amber" : "bg-aqua"}`}
                  style={{ width: `${Math.max(6, risk.score * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-foreground">{Math.round(risk.score * 100)}%</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{riskCopy} · {lang === "ar" ? "إشارة لا حكم." : "a signal, not a verdict."}</p>
          </Card>
        </div>
      </div>

      {!acc.settings?.tour_done && <FirstRunTour t={t} lang={lang} onDone={finishTour} />}
    </>
  );
}