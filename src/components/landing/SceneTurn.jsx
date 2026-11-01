import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/** Scene 4 — The Turn. Light returns and the loop is scroll-lit, step by step. */
export default function SceneTurn({ lang = "en" }) {
  const ar = lang === "ar";
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(5, Math.max(0, Math.round(v * 6.2))));
  });

  const lightUp = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const glow = useTransform(scrollYProgress, [0.15, 0.55], [0.1, 0.9]);

  const steps = ar
    ? [
        { k: "خطّط", d: "خطوة بحجم أسبوعك الحقيقي — لا بحجم الطموح." },
        { k: "نفّذ", d: "خطوة واحدة قابلة للقياس، في وقت مقترح من بياناتك." },
        { k: "تعلّم", d: "كل تسجيل يحدّث ما نعرفه عن الحجم والتوقيت والنبرة." },
        { k: "تكيّف", d: "الخطة تتغيّر قبل أن يصبح التعثّر عادة." },
        { k: "تعافَ", d: "نعود بخطوة أصغر — وتقدّمك محفوظ كما هو." },
      ]
    : [
        { k: "Plan", d: "One action sized to your real week — not to your ambition." },
        { k: "Act", d: "A single measurable step, at a time your own data suggests." },
        { k: "Learn", d: "Every log updates what we know about size, timing and tone." },
        { k: "Adapt", d: "The plan shifts before a lapse has time to become a habit." },
        { k: "Recover", d: "We return with a smaller step — and your progress untouched." },
      ];

  return (
    <section id="how" ref={ref} aria-label={ar ? "التحوّل" : "The turn"} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#04120f]" />
        <motion.div
          aria-hidden="true"
          style={{ opacity: lightUp }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_108%,rgba(255,184,107,0.42),rgba(95,227,200,0.16)_45%,transparent_72%)]" />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
          <motion.p style={{ opacity: glow }} className="eyebrow mb-4">
            {ar ? "المشهد الرابع — التحوّل" : "Scene four — the turn"}
          </motion.p>
          <h2 className="display max-w-3xl text-[9.5vw] leading-[0.98] text-sand sm:text-5xl lg:text-6xl">
            {ar ? "ماذا لو لم يُعِدك أسبوع سيّئ إلى الصفر؟" : "What if a bad week didn't reset you to zero?"}
          </h2>

          <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-5 md:gap-3">
            {steps.map((s, i) => {
              const on = active > i;
              return (
                <motion.div
                  key={s.k}
                  className="relative rounded-2xl border p-4 transition-colors duration-500 md:p-5"
                  style={{
                    borderColor: on ? "rgba(95,227,200,0.45)" : "rgba(232,213,183,0.12)",
                    background: on ? "rgba(95,227,200,0.06)" : "transparent",
                    boxShadow: on ? "0 18px 50px -30px rgba(95,227,200,0.8)" : "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full border text-[10px]"
                      style={{ borderColor: on ? "rgba(95,227,200,0.7)" : "rgba(232,213,183,0.25)", color: on ? "#5fe3c8" : "rgba(232,213,183,0.5)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-heading text-sm tracking-tight text-sand">{s.k}</span>
                  </div>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-sand/55">{s.d}</p>
                  {i < steps.length - 1 && (
                    <span aria-hidden="true" className="absolute -end-2 top-1/2 hidden h-px w-4 bg-sand/15 md:block" />
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.p style={{ opacity: glow }} className="mt-8 max-w-lg text-sm leading-relaxed text-sand/60">
            {ar
              ? "الحلقة لا تكتمل بالكمال — بل بالعودة. هذا هو الفرق بين برنامج ينتهي، وعادة تبقى."
              : "The loop is not completed by perfection. It is completed by returning. That is the difference between a programme that ends and a habit that lasts."}
          </motion.p>
        </div>
      </div>
    </section>
  );
}