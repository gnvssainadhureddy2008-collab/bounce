import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CountUp, Reveal } from "@/components/landing/Reveal";

/** Synthetic cohort — clearly labelled as demonstration data, never a claim. */
const COHORT = [
  { week: "W1", persistence: 100, comparison: 100 },
  { week: "W2", persistence: 92, comparison: 71 },
  { week: "W3", persistence: 87, comparison: 52 },
  { week: "W4", persistence: 79, comparison: 38 },
  { week: "W5", persistence: 74, comparison: 30 },
  { week: "W6", persistence: 72, comparison: 25 },
  { week: "W7", persistence: 66, comparison: 21 },
  { week: "W8", persistence: 68, comparison: 19 },
  { week: "W9", persistence: 65, comparison: 17 },
  { week: "W10", persistence: 64, comparison: 15 },
  { week: "W11", persistence: 64, comparison: 14 },
  { week: "W12", persistence: 63, comparison: 13 },
];

/** Scene 8 — Proof that it lasts. */
export default function SceneProof({ lang = "en" }) {
  const ar = lang === "ar";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = [
    { value: 2000, suffix: "", label: ar ? "في المجموعة التجريبية" : "in the demo cohort" },
    { value: 63, suffix: "%", label: ar ? "ما زالوا على الخطة في الأسبوع ١٢" : "still on plan at week 12" },
    { value: 71, suffix: "%", label: ar ? "تعافوا خلال ٧ أيام من التعثّر" : "recovered within 7 days of a lapse" },
    { value: 18, suffix: "", label: ar ? "نقطة تحسّن في السلوك المستهدف" : "point change in target behaviour", prefix: "+" },
  ];

  return (
    <section id="evidence" className="relative overflow-hidden bg-[#04121a] py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_10%,rgba(95,227,200,0.12),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-5">{ar ? "المشهد الثامن — الأثر" : "Scene eight — proof that it lasts"}</p>
            <h2 className="display max-w-2xl text-[10vw] leading-[0.98] text-sand sm:text-5xl">
              {ar ? "نقيس التغيير المستدام، لا التنزيلات." : "We measure sustained change, not downloads."}
            </h2>
          </div>
          <span className="rounded-full border border-amber/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-amber/80">
            {ar ? "بيانات تجريبية اصطناعية" : "Synthetic demo data"}
          </span>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-5 sm:p-7">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-sand/40">
              <span>{ar ? "الاستمرار — ١٢ أسبوعًا" : "Persistence — 12 weeks"}</span>
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-aqua" />{ar ? "باونس" : "Bounce"}</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sand/30" />{ar ? "برنامج عام" : "Generic programme"}</span>
              </span>
            </div>
            <div dir="ltr" className="mt-5 h-[240px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={COHORT} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bounceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(166 68% 63%)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="hsl(166 68% 63%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(190 22% 20%)" strokeDasharray="2 6" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: "hsl(190 14% 58%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(190 14% 58%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ background: "#071a20", border: "1px solid hsl(190 22% 22%)", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "hsl(36 54% 82%)" }}
                    />
                    <Area type="monotone" dataKey="comparison" stroke="hsl(36 30% 62%)" strokeWidth={1.5} fill="transparent" strokeDasharray="3 5" />
                    <Area type="monotone" dataKey="persistence" stroke="hsl(166 68% 63%)" strokeWidth={2.5} fill="url(#bounceFill)" animationDuration={2200} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-sand/35">
              {ar
                ? "منحنى اصطناعي يوضح شكل القياس: انخفاض ثم استعادة، لا خط مستقيم. لا يمثل نتائج فعلية."
                : "A synthetic curve to show the shape of measurement: dips and recoveries, not a straight line. Not a claim of real-world results."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="rounded-2xl border border-border/60 bg-card/40 p-5">
                <p className="display text-4xl text-sand">
                  <CountUp to={s.value} suffix={s.suffix} prefix={s.prefix || ""} />
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{s.label}</p>
              </Reveal>
            ))}
            <p className="col-span-2 text-[11px] leading-relaxed text-sand/35">
              {ar
                ? "«التغيير المستدام» = استمرار السلوك في الأسبوع الرابع وما بعده، مع تعافٍ خلال ٧ أيام من أي تعثّر — لا عدد مرات فتح التطبيق."
                : "“Sustained change” = the behaviour still present at week four and beyond, with recovery within seven days of any lapse — not app opens."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}