import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/** Scene 5 — Meet Bounce. The phone rises on parallax; the ring never loses value. */
export default function ScenePhone({ lang = "en", onSignIn }) {
  const ar = lang === "ar";
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 90, reduce ? 0 : -70]);
  const [smaller, setSmaller] = useState(false);

  const ring = 72;

  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-[#04131a] py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,rgba(95,227,200,0.13),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-5">{ar ? "المشهد الخامس — التعرّف" : "Scene five — meet Bounce"}</p>
          <h2 className="display text-[10vw] leading-[0.98] text-sand sm:text-5xl lg:text-6xl">
            {ar ? "خطوة واحدة. كل يوم." : "One small thing. Every day."}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {ar
              ? "لا لوحة معلومات مليئة بالحلقات المكسورة. بطاقة واحدة: افعلها، أو صغّرها، أو ليس اليوم. الثلاثة تُعلّم المحرك شيئًا."
              : "No dashboard full of broken streaks. One card: do it, make it smaller, or not today. All three teach the engine something."}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-sand/70">
            {(ar
              ? ["اضغط «أصغر من فضلك» فيصغر الطلب فورًا", "حلقة الثبات لا تنخفض حين تعيد الجدولة", "كل قرار يشرح نفسه: التقنية والأدلة والحدود"]
              : ["Press “Smaller please” and the ask shrinks instantly", "The ring never drops because you rescheduled", "Every card explains itself: technique, evidence, limits"]
            ).map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aqua" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onSignIn}
            className="mt-10 rounded-full bg-sand px-6 py-3 text-sm font-medium text-[#06161c] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {ar ? "جرّبها الآن" : "Try it now"}
          </button>
        </div>

        <motion.div style={{ y }} className="relative mx-auto w-full max-w-[300px]">
          <div aria-hidden="true" className="absolute -inset-10 rounded-[4rem] bg-aqua/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.6rem] border border-sand/20 bg-[#06161c] p-2.5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="absolute left-1/2 top-3 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-sand/20" />
            <div className="rounded-[2.1rem] bg-[linear-gradient(180deg,#08222a,#06141880)] px-4 pb-6 pt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sand/40">{ar ? "اليوم" : "Today"}</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 40 40" className="h-16 w-16 -rotate-90">
                    <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(232,213,183,0.14)" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r="17" fill="none" stroke="#5fe3c8" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(ring / 100) * 106.8} 106.8`}
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-xs font-medium text-sand">{ring}</span>
                </div>
                <div>
                  <p className="text-[11px] text-sand/50">{ar ? "الثبات المرن" : "Resilient consistency"}</p>
                  <p className="text-[11px] text-aqua/80">{ar ? "يومَا سماح مستخدمان" : "2 grace days used"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-sand/12 bg-sand/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-sand/35">{ar ? "خطوتك الصغيرة" : "Your tiny action"}</p>
                <p className="mt-2 text-[13px] leading-snug text-sand">
                  {smaller
                    ? (ar ? "قف وامشِ ٣ دقائق" : "Stand up and walk for 3 minutes")
                    : (ar ? "مشي ١٠ دقائق بخطى مريحة" : "A 10-minute walk at an easy pace")}
                </p>
                <p className="mt-1 text-[11px] text-sand/45">{ar ? "٧:٣٠ صباحًا · بعد الفجر" : "07:30 · after Fajr"}</p>
                <div className="mt-3 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-aqua" : "bg-sand/15"}`} />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSmaller((s) => !s)}
                className="mt-3 w-full rounded-xl border border-aqua/40 bg-aqua/10 py-2.5 text-[12px] text-aqua transition-colors hover:bg-aqua/20"
              >
                {smaller ? (ar ? "أعد الحجم الأصلي" : "Back to the original") : (ar ? "أصغر من فضلك" : "Smaller please")}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <span className="rounded-xl bg-sand px-2 py-2.5 text-center text-[12px] font-medium text-[#06161c]">{ar ? "أنجزت" : "Done"}</span>
                <span className="rounded-xl border border-sand/15 px-2 py-2.5 text-center text-[12px] text-sand/60">{ar ? "ليس اليوم" : "Not today"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}