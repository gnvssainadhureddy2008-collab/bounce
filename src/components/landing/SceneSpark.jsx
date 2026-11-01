import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Scene 1 — The Spark. Dawn rises, a figure walks the horizon path drawn by scroll. */
export default function SceneSpark({ lang = "en" }) {
  const ar = lang === "ar";
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const skyOpacity = useTransform(scrollYProgress, [0, 0.45], [0.15, 1]);
  const skyY = useTransform(scrollYProgress, [0, 1], ["12%", "-4%"]);
  const walkerX = useTransform(scrollYProgress, [0.1, 0.9], ["-2%", "86%"]);
  const copyOpacity = useTransform(scrollYProgress, [0.08, 0.22, 0.86, 0.97], [0, 1, 1, 0.15]);
  const copyY = useTransform(scrollYProgress, [0.08, 0.35], [24, 0]);

  return (
    <section ref={ref} aria-label={ar ? "الشرارة" : "The spark"} className="relative h-[210vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{ opacity: skyOpacity, y: reduce ? 0 : skyY }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#06161c_0%,#0a2b33_38%,#1d4a4a_62%,#8a5a3c_82%,#ffb86b_100%)]" />
          <div className="absolute bottom-0 left-1/2 h-[45vmin] w-[70vmin] -translate-x-1/2 translate-y-1/3 rounded-full bg-amber/30 blur-[80px]" />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
          <motion.div style={{ opacity: copyOpacity, y: reduce ? 0 : copyY }}>
            <p className="eyebrow mb-5">{ar ? "المشهد الأول — الشرارة" : "Scene one — the spark"}</p>
            <h2 className="display max-w-3xl text-[11vw] leading-[0.95] text-sand sm:text-6xl lg:text-7xl">
              {ar ? "الاثنين. تقرّر أن تتغيّر." : "Monday. You decide to change."}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-sand/65 sm:text-base">
              {ar
                ? "خطة واضحة، وهدف معقول، وشعور بأن هذه المرة ستنجح. هذا الشعور حقيقي — وهو لا يكفي وحده."
                : "A clear plan, a reasonable goal, and the feeling that this time it will hold. The feeling is real. It is also not a plan."}
            </p>
          </motion.div>
        </div>

        {/* horizon path, drawn by scroll */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[16%] z-[6] h-32 px-4">
          <svg viewBox="0 0 1000 120" className="h-full w-full" fill="none">
            <path d="M0 96 C 180 96, 260 44, 420 60 S 700 104, 1000 46" stroke="rgba(232,213,183,0.14)" strokeWidth="2" strokeDasharray="4 10" />
            <motion.path
              d="M0 96 C 180 96, 260 44, 420 60 S 700 104, 1000 46"
              stroke="rgba(95,227,200,0.85)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: reduce ? 1 : scrollYProgress }}
            />
            <motion.g style={{ x: reduce ? 0 : walkerX }} fill="#04100f">
              <circle cx="0" cy="60" r="5" />
              <rect x="-1.5" y="62" width="3" height="20" rx="1.5" />
            </motion.g>
          </svg>
        </div>
      </div>
    </section>
  );
}