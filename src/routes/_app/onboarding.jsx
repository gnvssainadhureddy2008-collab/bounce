import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { BEHAVIORS, BEHAVIOR_META, TEXT } from "@/lib/content";
import { buildWeek, isoDate } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";
import { createMany, saveSettings } from "@/lib/store";
import { PageHeader } from "@/components/app/States";

export const Route = createFileRoute("/_app/onboarding")({
  head: () => ({ meta: [{ title: "Set up your plan — Bounce" }] }),
  component: Onboarding,
});

const WORK = [
  { id: "office", key: "onboard.office" },
  { id: "shifts", key: "onboard.shifts" },
  { id: "remote", key: "onboard.remote" },
];

const CHANNELS = [
  { id: "app", en: "In app", ar: "داخل التطبيق" },
  { id: "whatsapp", en: "WhatsApp", ar: "واتساب" },
  { id: "sms", en: "SMS", ar: "رسالة نصية" },
  { id: "coach", en: "Human coach", ar: "مدرب بشري" },
];

function Onboarding() {
  const acc = useAccount();
  const { t, lang, setLang, toggleCalm, largeText, setLargeText, calm, simple } = usePrefs();
  const navigate = useNavigate();
  const ar = lang === "ar";

  const [step, setStep] = useState(0);
  const [behaviors, setBehaviors] = useState([]);
  const [ownGoal, setOwnGoal] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [quitDate, setQuitDate] = useState("");
  const [workPattern, setWorkPattern] = useState("office");
  const [channel, setChannel] = useState("app");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [mobility, setMobility] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [fasting, setFasting] = useState(false);
  const [consents, setConsents] = useState({ steps: true, checkins: true, reminders: false });
  const [saving, setSaving] = useState(false);

  const toggleBehavior = (b) =>
    setBehaviors((list) => (list.includes(b) ? list.filter((x) => x !== b) : list.length >= 2 ? list : [...list, b]));

  const canNext = step === 0 ? behaviors.length > 0 : true;

  const finish = async () => {
    setSaving(true);
    try {
      const created = behaviors.map((b) => ({
        behavior: b,
        own_goal: ownGoal || null,
        minutes_per_day: minutes,
        work_pattern: workPattern,
        status: "active",
        quit_date: b === "smoking" && quitDate ? quitDate : null,
        fasting_aware: fasting,
      }));
      const goals = await createMany("goals", created);
      const week = buildWeek({
        goals: created,
        map: {},
        startDate: isoDate(),
        lang,
        accessibility: { mobility },
      });
      await createMany("actions", week);
      await saveSettings(
        {
          language: lang,
          theme: "dark",
          calm_mode: calm,
          simple_language: simple,
          large_text: largeText,
          mobility,
          screen_reader: screenReader,
          fasting_aware: fasting,
          channel,
          quiet_start: quietStart,
          quiet_end: quietEnd,
          consents: { ...consents, recorded_at: new Date().toISOString() },
          onboarded: true,
          display_name: acc.user?.full_name || "",
        },
        acc.settings,
      );
      toast.success(t("toast.planSaved"));
      navigate({ to: "/today" });
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t("onboard.title")}
        subtitle={`${ar ? "خطوة" : "Step"} ${step + 1} ${t("common.of")} 3`}
      />

      <div className="mb-8 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-aqua" : "bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {step === 0 && (
            <>
              <div>
                <h2 className="font-heading text-lg text-foreground">{t("onboard.step.behaviors")}</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">{t("onboard.pickUp")}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {BEHAVIORS.map((b) => {
                    const on = behaviors.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleBehavior(b)}
                        aria-pressed={on}
                        className={`rounded-2xl border p-4 text-start transition-colors ${on ? "border-aqua/60 bg-aqua/[0.08]" : "border-border hover:border-sand/30"}`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-heading text-[13.5px] text-foreground">{TEXT(BEHAVIOR_META[b].label, lang)}</span>
                          {on && <Check className="h-4 w-4 text-aqua" />}
                        </span>
                        <span className="mt-1.5 block text-[11.5px] leading-relaxed text-muted-foreground">{TEXT(BEHAVIOR_META[b].blurb, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="own-goal" className="text-[12px] text-muted-foreground">
                  {ar ? "هدفك بكلماتك (اختياري)" : "Your own goal, in your words (optional)"}
                </label>
                <input
                  id="own-goal"
                  value={ownGoal}
                  onChange={(e) => setOwnGoal(e.target.value)}
                  placeholder={ar ? "مثال: أعود للمشي مع ابني" : "e.g. walk with my son again"}
                  className="mt-2 w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 text-[13px] outline-none focus:border-aqua/50"
                />
              </div>

              <div>
                <label htmlFor="minutes" className="text-[12px] text-muted-foreground">{t("onboard.time")}</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    id="minutes"
                    type="range"
                    min="3"
                    max="45"
                    step="1"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-[hsl(var(--aqua))]"
                  />
                  <span className="w-16 text-end text-[13px] text-foreground">{minutes} {t("common.minutes")}</span>
                </div>
              </div>

              {behaviors.includes("smoking") && (
                <div>
                  <label htmlFor="quit" className="text-[12px] text-muted-foreground">{t("onboard.quitDate")}</label>
                  <input
                    id="quit"
                    type="date"
                    value={quitDate}
                    onChange={(e) => setQuitDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-[13px] outline-none focus:border-aqua/50"
                  />
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h2 className="font-heading text-lg text-foreground">{t("onboard.work")}</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {WORK.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWorkPattern(w.id)}
                      aria-pressed={workPattern === w.id}
                      className={`rounded-xl border px-3 py-3 text-[12.5px] transition-colors ${workPattern === w.id ? "border-aqua/60 bg-aqua/[0.08] text-foreground" : "border-border text-muted-foreground hover:border-sand/30"}`}
                    >
                      {t(w.key)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
                <span className="text-[12.5px] text-foreground">{t("common.language")}</span>
                <div className="flex gap-2">
                  {[["en", "English"], ["ar", "العربية"]].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLang(id)}
                      aria-pressed={lang === id}
                      className={`rounded-full border px-3 py-1.5 text-[12px] ${lang === id ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[12px] text-muted-foreground">{t("onboard.access")}</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { on: largeText, set: () => setLargeText(!largeText), label: t("onboard.large") },
                    { on: screenReader, set: () => setScreenReader(!screenReader), label: t("onboard.screenReader") },
                    { on: calm, set: toggleCalm, label: t("onboard.reduced") },
                    { on: mobility, set: () => setMobility(!mobility), label: t("onboard.mobility") },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.set}
                      aria-pressed={item.on}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-[12.5px] transition-colors ${item.on ? "border-aqua/60 bg-aqua/[0.08] text-foreground" : "border-border text-muted-foreground"}`}
                    >
                      {item.label}
                      <span className={`h-4 w-4 rounded-full border ${item.on ? "border-aqua bg-aqua" : "border-border"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[12px] text-muted-foreground">{t("onboard.channel")}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChannel(c.id)}
                      aria-pressed={channel === c.id}
                      className={`rounded-full border px-3.5 py-2 text-[12px] ${channel === c.id ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground"}`}
                    >
                      {ar ? c.ar : c.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="qs" className="text-[12px] text-muted-foreground">{t("onboard.quiet")} — {ar ? "من" : "from"}</label>
                  <input id="qs" type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13px]" />
                </div>
                <div>
                  <label htmlFor="qe" className="text-[12px] text-muted-foreground">{t("onboard.quiet")} — {ar ? "إلى" : "to"}</label>
                  <input id="qe" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-[13px]" />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-[12.5px] text-muted-foreground">
                <input type="checkbox" checked={fasting} onChange={(e) => setFasting(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--aqua))]" />
                {ar ? "أصوم بعض الأيام — راعِ ذلك في التوقيت" : "I fast on some days — keep timing aware of it"}
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="font-heading text-lg text-foreground">{t("onboard.consent")}</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {ar
                    ? "كل مفتاح منفصل، ويمكن إغلاقه في أي وقت من «بياناتي»."
                    : "Each switch is separate, and can be turned off at any time in My data."}
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { id: "steps", label: t("onboard.consent.steps") },
                    { id: "checkins", label: t("onboard.consent.checkins") },
                    { id: "reminders", label: t("onboard.consent.reminders") },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="switch"
                      aria-checked={consents[c.id]}
                      onClick={() => setConsents((s) => ({ ...s, [c.id]: !s[c.id] }))}
                      className="flex w-full items-start gap-3 rounded-xl border border-border p-4 text-start transition-colors hover:border-aqua/30"
                    >
                      <span className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${consents[c.id] ? "bg-aqua/80" : "bg-secondary"}`}>
                        <span className={`h-4 w-4 rounded-full bg-background transition-transform ${consents[c.id] ? "translate-x-4 rtl:-translate-x-4" : ""}`} />
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-muted-foreground">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="rounded-xl border border-border/70 bg-secondary/30 p-4 text-[11.5px] leading-relaxed text-muted-foreground">
                {t("settings.guardrail")}
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border border-border px-5 py-2.5 text-[13px] text-muted-foreground disabled:opacity-40"
        >
          {t("common.back")}
        </button>
        {step < 2 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-sand px-6 py-2.5 text-[13px] font-medium text-[#06161c] disabled:opacity-40"
          >
            {t("common.continue")}
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={finish}
            className="flex items-center gap-2 rounded-full bg-sand px-6 py-2.5 text-[13px] font-medium text-[#06161c] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? t("onboard.building") : t("onboard.finish")}
          </button>
        )}
      </div>
    </div>
  );
}