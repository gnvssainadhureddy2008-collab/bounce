import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function ChainLink({ index, progress }) {
  const broken = index >= 3;
  const rotate = useTransform(progress, [0.55, 0.75], [0, broken ? (index === 3 ? -26 : 34) : 0]);
  const y = useTransform(progress, [0.55, 0.8], [0, broken ? (index === 3 ? 26 : 58) : 0]);
  const opacity = useTransform(progress, [0.55, 0.9], [1, broken ? 0.2 : 1]);
  return (
    <motion.span
      className="absolute top-1/2 h-14 w-11 -translate-y-1/2 rounded-full border"
      style={{
        left: `${index * 22}%`,
        rotate,
        y,
        opacity,
        borderColor: broken ? "rgba(232,213,183,0.2)" : "rgba(95,227,200,0.55)",
        background: broken ? "transparent" : "rgba(95,227,200,0.06)",
      }}
    />
  );
}

function Fragment({ label, index, progress }) {
  const opacity = useTransform(progress, [0.2 + index * 0.05, 0.4 + index * 0.05], [0, 0.9]);
  return (
    <motion.span className="rounded-full border border-sand/15 px-3 py-1 text-[11px] tracking-wide text-sand/45" style={{ opacity }}>
      {label}
    </motion.span>
  );
}

/** Scene 2 — The Fade. The sky dims, the line wavers, the chain snaps. */
export default function SceneFade({ lang = "en" }) {
  const ar = lang === "ar";
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const dim = useTransform(scrollYProgress, [0, 0.7], [0, 0.92]);
  const copyOpacity = useTransform(scrollYProgress, [0.05, 0.2, 0.9, 1], [0, 1, 1, 0.2]);
  const lineY = useTransform(scrollYProgress, [0.3, 0.75], [0, 70]);
  const lineRotate = useTransform(scrollYProgress, [0.3, 0.5, 0.65, 0.75], [0, 1.4, -1.2, 0.8]);

  const fragments = ar
    ? ["الورديات", "الحرارة", "الصيام", "العائلة", "التعب", "السفر"]
    : ["Shifts", "Heat", "Fasting", "Family", "Fatigue", "Travel"];

  return (
    <section ref={ref} aria-label={ar ? "الخبو" : "The fade"} className="relative h-[230vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#1d4a4a_0%,#123037_45%,#071a20_100%)]" />
        <motion.div aria-hidden="true" style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-[#030b0e]" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div style={{ opacity: copyOpacity }}>
            <p className="eyebrow mb-5">{ar ? "المشهد الثاني — الخبو" : "Scene two — the fade"}</p>
            <h2 className="display max-w-xl text-[10vw] leading-[0.98] text-sand/90 sm:text-5xl lg:text-6xl">
              {ar ? "ثم تأتي الحياة." : "Then life happens."}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-sand/55 sm:text-base">
              {ar
                ? "ورديات تتغيّر. حرّ في يوليو. صيام. واجبات عائلية. يوم واحد فائت، ثم يومان. ولم يكن أحد حولك ليقول: هذا طبيعي، لنبدأ من هنا."
                : "Shifts move. July gets hot. Fasting begins. Family needs you. One missed day becomes two — and nobody was there to say: this is normal, let us start from here."}
            </p>
          </motion.div>

          <div aria-hidden="true" className="relative h-40 w-full max-w-sm justify-self-center">
            {[0, 1, 2, 3, 4].map((i) => <ChainLink key={i} index={i} progress={scrollYProgress} />)}
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          style={{ y: reduce ? 0 : lineY, rotate: reduce ? 0 : lineRotate }}
          className="absolute bottom-[24%] left-1/2 z-10 h-px w-[70%] max-w-lg -translate-x-1/2 bg-gradient-to-r from-transparent via-coral/70 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-8 z-10 flex flex-wrap justify-center gap-2 px-6">
          {fragments.map((f, i) => <Fragment key={f} label={f} index={i} progress={scrollYProgress} />)}
        </div>
      </div>
    </section>
  );
}