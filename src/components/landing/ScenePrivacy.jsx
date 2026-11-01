import { useState } from "react";
import { Reveal } from "@/components/landing/Reveal";

/** Scene 7 — Your data, your rules. Real, working consent toggles. */
export default function ScenePrivacy({ lang = "en" }) {
  const ar = lang === "ar";
  const [on, setOn] = useState({ steps: true, checkins: true, reminders: false });

  const rows = [
    {
      id: "steps",
      label: ar ? "بيانات الحركة والخطوات" : "Movement and step data",
      note: ar ? "لملاءمة النصيحة مع قدرتك الحقيقية." : "So advice matches your real capacity.",
    },
    {
      id: "checkins",
      label: ar ? "تحية المزاج والطاقة" : "Mood and energy check-ins",
      note: ar ? "ليقابل اليوم الصعب بخطوة أصغر." : "So a hard day gets a smaller ask.",
    },
    {
      id: "reminders",
      label: ar ? "تذكيرات داخل ساعات الاستيقاظ" : "Reminders inside waking hours",
      note: ar ? "لا شيء بين ٢٢:٠٠ و٠٧:٠٠." : "Never between 22:00 and 07:00.",
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-[#06161c] py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_20%_30%,rgba(11,58,66,0.6),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-5">{ar ? "المشهد السابع — بياناتك" : "Scene seven — your data"}</p>
          <h2 className="display text-[10vw] leading-[0.98] text-sand sm:text-5xl">
            {ar ? "بياناتك، بشروطك." : "Your data, your rules."}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            {ar
              ? "كل مصدر بيانات مفتاح منفصل، بتاريخ موافقة واضح، ويمكن إغلاقه في أي وقت. تصدير كل شيء بملف واحد. حذف كل شيء بضغطة واحدة."
              : "Every source is a separate switch with a timestamped consent, and can be turned off at any time. Export everything as one file. Delete everything in one step."}
          </p>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-aqua/25 bg-aqua/[0.05] p-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-aqua" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <p className="text-[13px] leading-relaxed text-sand/75">
              {ar
                ? "أصحاب العمل وشركات التأمين لا يحصلون أبدًا على بيانات فردية. تقارير البرنامج مجمّعة، وتُحجب المجموعات الأصغر من ٢٠ شخصًا."
                : "Employers and insurers never receive individual-level data. Programme reporting is aggregate only, and groups smaller than 20 are suppressed."}
            </p>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-md sm:p-8">
            <p className="eyebrow mb-5">{ar ? "ما يسمح به باونس" : "What Bounce may use"}</p>
            <div className="space-y-3">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="switch"
                  aria-checked={on[r.id]}
                  onClick={() => setOn((s) => ({ ...s, [r.id]: !s[r.id] }))}
                  className="flex w-full items-start gap-4 rounded-2xl border border-border/60 bg-background/40 p-4 text-start transition-colors hover:border-aqua/30"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${on[r.id] ? "bg-aqua/80" : "bg-sand/15"}`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-[#06161c] transition-transform duration-300 ${on[r.id] ? "translate-x-[22px] rtl:-translate-x-[22px]" : ""}`}
                    />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-sand">{r.label}</span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">{r.note}</span>
                    <span className="mt-1.5 block text-[10px] uppercase tracking-[0.2em] text-sand/25">
                      {on[r.id] ? (ar ? "موافقة · مسجّلة" : "Consented · logged") : (ar ? "متوقف" : "Off")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}