import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HeartPulse, Moon, Salad, Timer, Wind } from "lucide-react";
import { Card, PageHeader, PageSkeleton } from "@/components/app/States";
import { BEHAVIORS, BEHAVIOR_META, TEXT } from "@/lib/content";
import { isoDate, daysBetween } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";
import { createOne, updateOne } from "@/lib/store";

export const Route = createFileRoute("/_app/modules")({
  head: () => ({ meta: [{ title: "Modules — Bounce" }] }),
  component: ModulesPage,
});

const TRIGGERS = [
  { id: "coffee", en: "Coffee", ar: "القهوة" },
  { id: "stress", en: "Stress", ar: "التوتر" },
  { id: "meal", en: "After a meal", ar: "بعد الوجبة" },
  { id: "driving", en: "Driving", ar: "القيادة" },
  { id: "social", en: "Being with smokers", ar: "مع مدخنين" },
  { id: "boredom", en: "Boredom", ar: "الملل" },
];

function ModulesPage() {
  const acc = useAccount();
  const { t, lang } = usePrefs();
  const ar = lang === "ar";
  const [tab, setTab] = useState("smoking");

  if (acc.loading) return <PageSkeleton />;

  const goal = acc.goals.find((g) => g.behavior === tab) || acc.goals.find((g) => g.behavior === "smoking") || acc.goals[0];
  const triggers = acc.logs.filter((l) => (l.note || "").startsWith("trigger:"));

  return (
    <>
      <PageHeader title={t("modules.title")} subtitle={ar ? "وحدات صغيرة، كل واحدة تعمل وحدها." : "Small modules, each one useful on its own."} />

      <div className="mb-5 flex flex-wrap gap-2">
        {BEHAVIORS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setTab(b)}
            aria-pressed={tab === b}
            className={`rounded-full border px-3.5 py-2 text-[12px] transition-colors ${tab === b ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground"}`}
          >
            {TEXT(BEHAVIOR_META[b].label, lang)}
          </button>
        ))}
      </div>

      {tab === "smoking" && <SmokingModule acc={acc} goal={goal} lang={lang} t={t} triggers={triggers} />}
      {tab === "sleep" && <InfoModule icon={Moon} items={ar
        ? ["نافذة نوم ثابتة، حتى بعد وردية متأخرة.", "تهدئة ٣٠ دقيقة بلا شاشات.", "لا كافيين بعد العصر إن كان النوم يتأثر."]
        : ["A consistent sleep window, even after a late shift.", "A 30-minute screen-free wind-down.", "No caffeine after midday if sleep is affected."]} note={ar ? "النوم أول سلوك ينهار في الورديات — لذلك يُبنى حول جدولك لا ضدّه." : "Sleep is the first behaviour to break under shift work — so it is built around your rota, not against it."} />}
      {tab === "nutrition" && <InfoModule icon={Salad} items={ar
        ? ["ابدأ بكوب ماء قبل أي تغيير آخر.", "نصف الطبق خضار — بطعامك المعتاد، لا بقائمة جديدة.", "استبدال واحد أسبوعيًا أفضل من حمية كاملة."]
        : ["Start with one glass of water before any other change.", "Half the plate vegetables — using food you already eat.", "One swap a week beats a whole new diet."]} note={ar ? "التبديلات تُبنى على مطبخك وثقافتك: الأرز والخبز والتمر تبقى، ويتغيّر المقدار والرفيق." : "Swaps are built on your own kitchen and culture: rice, bread and dates stay — the portion and the company change."} />}
      {tab === "movement" && <InfoModule icon={HeartPulse} items={ar
        ? ["٣ دقائق مشي كل ساعة أفضل من ٣٠ دقيقة مرة واحدة.", "خيارات جلوس للحركة المحدودة.", "المشي بعد الفجر أسهل التزامًا في الصيف."]
        : ["Three minutes of walking each hour beats one 30-minute session you skip.", "Seated options for limited mobility.", "A walk after Fajr is easier to keep in summer heat."]} note={ar ? "لا صالة رياضية ولا ملابس خاصة. الحركة تُقاس بالدقائق التي حدثت فعلًا." : "No gym and no kit required. Movement is counted in minutes that actually happened."} />}
    </>
  );
}

function InfoModule({ icon: Icon, items, note }) {
  return (
    <Card>
      <Icon className="h-5 w-5 text-aqua" strokeWidth={1.6} />
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aqua/70" />
            {i}
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-xl border border-border/70 bg-secondary/30 p-3.5 text-[11.5px] leading-relaxed text-muted-foreground">{note}</p>
    </Card>
  );
}

function SmokingModule({ acc, goal, lang, t, triggers }) {
  const ar = lang === "ar";
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);
  const [cigs, setCigs] = useState(goal?.cigarettes_per_day ?? 10);
  const [price, setPrice] = useState(goal?.pack_price ?? 24);

  useEffect(() => {
    if (!running) return undefined;
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s >= 180) { clearInterval(timer.current); setRunning(false); return 180; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  const quit = goal?.quit_date || "";
  const daysQuit = quit ? Math.max(0, daysBetween(quit, isoDate())) : 0;
  const saved = Math.round((daysQuit * (Number(cigs) || 0) / 20) * (Number(price) || 0));

  const logTrigger = async (trigger) => {
    await createOne("logs", {
      date: isoDate(),
      behavior: "smoking",
      outcome: "partial",
      note: `trigger:${trigger}`,
      size: "micro",
      source: "live",
    });
    await acc.reload();
    toast.success(ar ? "سُجّل المحفّز — هذا وعي لا ضعف." : "Trigger logged — that is awareness, not weakness.");
  };

  const saveGoal = async () => {
    if (!goal) return;
    await updateOne("goals", goal.id, { cigarettes_per_day: Number(cigs), pack_price: Number(price) });
    await acc.reload();
    toast.success(t("common.saved"));
  };

  const remaining = Math.max(0, 180 - seconds);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const breath = remaining > 120 ? (ar ? "شهيق هادئ… ثم زفير أطول" : "Breathe in slowly… then out longer")
    : remaining > 60 ? (ar ? "تأجيل: الرغبة موجة، لا أمر" : "Delay: a craving is a wave, not an order")
    : (ar ? "أشغل يديك: ماء، مشي، مكالمة" : "Distract your hands: water, a short walk, a call");

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <Card className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aqua/10 blur-3xl" />
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-aqua" />
          <p className="text-[12.5px] text-foreground">{t("modules.craving")}</p>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{t("modules.cravingCoach")}</p>
        <div className="mt-6 flex items-center gap-5">
          <div className="relative grid h-24 w-24 place-items-center">
            <span className="absolute inset-0 rounded-full border border-aqua/30" style={{ animation: running ? "breathe 4s ease-in-out infinite" : "none" }} />
            <span className="absolute inset-3 rounded-full border border-aqua/20" />
            <span className="font-heading text-xl text-foreground">{mm}:{ss}</span>
          </div>
          <div className="flex-1">
            <p className="text-[12.5px] leading-relaxed text-foreground">{running ? breath : (ar ? "دقيقتان إلى ثلاث تكفي غالبًا لتعبر الموجة." : "Two or three minutes is usually enough for the wave to pass.")}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => { setSeconds(0); setRunning(true); }}
                className="rounded-full bg-sand px-4 py-2 text-[12px] font-medium text-[#06161c]"
              >
                {t("modules.start")}
              </button>
              <button
                type="button"
                onClick={() => { setRunning(false); setSeconds(0); }}
                className="rounded-full border border-border px-4 py-2 text-[12px] text-muted-foreground"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-aqua" />
          <p className="text-[12.5px] text-foreground">{t("modules.triggers")}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TRIGGERS.map((tr) => {
            const count = triggers.filter((l) => (l.note || "").includes(`trigger:${tr.id}`)).length;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => logTrigger(tr.id)}
                className="rounded-full border border-border px-3 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:border-aqua/50 hover:text-foreground"
              >
                {ar ? tr.ar : tr.en}{count ? ` · ${count}` : ""}
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cigs" className="text-[10.5px] text-muted-foreground">{ar ? "سيجارة يوميًا" : "Cigarettes a day"}</label>
            <input id="cigs" type="number" min="0" value={cigs} onChange={(e) => setCigs(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background/60 px-2.5 py-2 text-[12px]" />
          </div>
          <div>
            <label htmlFor="price" className="text-[10.5px] text-muted-foreground">{ar ? "سعر العلبة (درهم)" : "Pack price (AED)"}</label>
            <input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background/60 px-2.5 py-2 text-[12px]" />
          </div>
        </div>
        <button type="button" onClick={saveGoal} disabled={!goal} className="mt-3 w-full rounded-lg border border-border py-2 text-[11.5px] text-foreground disabled:opacity-40">
          {t("common.save")}
        </button>
        <p className="mt-4 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{t("modules.savings")}</p>
        <p className="font-heading text-2xl text-foreground">AED {saved}</p>
        <p className="text-[11px] text-muted-foreground">{quit ? `${daysQuit} ${t("common.days")} · ${ar ? "منذ تاريخ الإقلاع" : "since your quit date"}` : (ar ? "أضف تاريخ الإقلاع في الإعداد" : "Add a quit date during setup")}</p>
      </Card>

      <Card className="border-amber/25 bg-amber/[0.05] lg:col-span-2">
        <p className="text-[12.5px] text-foreground">{t("modules.clinician")}</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{t("modules.clinicianBody")}</p>
      </Card>
    </div>
  );
}