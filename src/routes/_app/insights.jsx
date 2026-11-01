import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyState, ErrorNote, PageHeader, PageSkeleton } from "@/components/app/States";
import { VARIANTS, bestVariant, recoveryStats, resilientScore, statsMap, weeklyTrend } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";

export const Route = createFileRoute("/_app/insights")({
  head: () => ({ meta: [{ title: "How Bounce learns — Bounce" }] }),
  component: InsightsPage,
});

const DIM = {
  size: { en: "Action size", ar: "حجم الخطوة" },
  timing: { en: "Time of day", ar: "وقت اليوم" },
  tone: { en: "Tone", ar: "النبرة" },
  channel: { en: "Channel", ar: "القناة" },
};

function InsightsPage() {
  const acc = useAccount();
  const { t, lang } = usePrefs();
  const ar = lang === "ar";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (acc.loading) return <PageSkeleton />;
  if (acc.error) return <ErrorNote error={acc.error} onRetry={acc.reload} retryLabel={t("common.tryAgain")} />;

  const map = statsMap(acc.stats);
  const best = {
    timing: bestVariant(map, "timing"),
    size: bestVariant(map, "size"),
    tone: bestVariant(map, "tone"),
  };
  const trend = weeklyTrend(acc.logs, 8);
  const score = resilientScore(acc.logs);
  const rec = recoveryStats(acc.lapses);
  const totalTrials = acc.stats.reduce((s, r) => s + (r.trials || 0), 0);

  const headline = (() => {
    if (!best.timing) return ar ? "لا توجد بيانات كافية بعد. أول تسجيل يبدأ التعلّم." : "Not enough data yet. Your first log starts the learning.";
    const time = ar
      ? { morning: "الصباح", midday: "الظهيرة", evening: "المساء" }[best.timing.variant]
      : best.timing.variant;
    return ar
      ? `أفضل وقت لديك حتى الآن هو ${time}، وحجم الخطوة الأنسب ${best.size?.variant || "صغير"}. النبرة ${best.tone?.variant || "لطيفة"} تناسبك أكثر.`
      : `Your strongest window so far is the ${time}, and the size that lands best is ${best.size?.variant || "small"}. A ${best.tone?.variant || "gentle"} tone works better for you.`;
  })();

  return (
    <>
      <PageHeader title={t("insights.title")} subtitle={t("insights.subtitle")} />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { key: "insights.bestTime", value: best.timing },
          { key: "insights.bestSize", value: best.size },
          { key: "insights.bestTone", value: best.tone },
        ].map((item) => (
          <Card key={item.key}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t(item.key)}</p>
            <p className="mt-2 font-heading text-lg text-foreground">{item.value ? item.value.variant : "—"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {item.value ? `${item.value.trials} ${t("insights.trials")} · ${Math.round(item.value.mean * 100)}%` : (ar ? "نتعلّم" : "still learning")}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("insights.explain")}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground">{headline}</p>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {ar
            ? `مجموع المحاولات: ${totalTrials}. كل محاولة تحدّث أربعة توزيعات احتمالية، ولا تُستخدم للمقارنة بين الأشخاص.`
            : `${totalTrials} trials in total. Every trial updates four probability distributions, and none of this is used to compare you with anyone else.`}
        </p>
      </Card>

      <Card className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {ar ? "إحصاءات المحرك (مباشرة)" : "Bandit statistics (live)"}
        </p>
        <div className="mt-4 space-y-4">
          {Object.keys(DIM).map((dim) => (
            <div key={dim}>
              <p className="mb-1.5 text-[11.5px] text-foreground">{ar ? DIM[dim].ar : DIM[dim].en}</p>
              <div className="space-y-1">
                {VARIANTS[dim].map((v) => {
                  const row = acc.stats.find((r) => r.dimension === dim && r.variant === v);
                  const trials = row?.trials || 0;
                  const rate = trials ? Math.round(((row.successes || 0) / trials) * 100) : 0;
                  return (
                    <div key={v} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-[10.5px] text-muted-foreground">{v}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <span className="block h-full rounded-full bg-aqua/70 transition-all duration-700" style={{ width: `${rate}%` }} />
                      </span>
                      <span className="w-16 shrink-0 text-end text-[10px] text-muted-foreground">{trials ? `${rate}% · ${trials}` : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("insights.trend")}</p>
          <p className="text-[11px] text-muted-foreground">
            {t("insights.consistency")} {score.score} · {t("insights.recovery")} {rec.avg != null ? `${rec.avg} ${t("common.days")}` : "—"}
          </p>
        </div>
        <div dir="ltr" className="mt-4 h-[220px] w-full">
          {mounted && trend.some((p) => p.score > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--aqua))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--aqua))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 6" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--aqua))" strokeWidth={2} fill="url(#trendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={ar ? "لا يوجد اتجاه بعد" : "No trend yet"} body={ar ? "سجّل خطوتين أو ثلاثًا وسيظهر هنا." : "Log two or three steps and this will fill in."} />
          )}
        </div>
      </Card>
    </>
  );
}