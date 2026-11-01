import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Scene 0 — the title card. A heartbeat glow becomes the wordmark, then lifts
 * away. Skippable, and it never traps anyone: it also fades on scroll or key press.
 */
export default function IntroOverlay({ lang = "en" }) {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) { setOpen(false); return undefined; }
    const timer = setTimeout(() => setOpen(false), 4200);
    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); window.removeEventListener("keydown", onKey); };
  }, [reduce]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[70] grid place-items-center bg-[#03080a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] } }}
          role="dialog"
          aria-label={lang === "ar" ? "شاشة العنوان" : "Title card"}
        >
          <motion.div
            className="pointer-events-none absolute h-[42vmin] w-[42vmin] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(95,227,200,0.28), transparent 65%)" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex flex-col items-center gap-6 px-6 text-center">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-aqua"
              style={{ boxShadow: "0 0 24px 6px rgba(95,227,200,0.55)" }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.h1
              className="display text-[13vw] leading-none tracking-[0.22em] text-sand sm:text-[7rem]"
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.22em" }}
              transition={{ duration: 1.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {lang === "ar" ? "باونس" : "BOUNCE"}
            </motion.h1>
            <motion.p
              className="max-w-sm text-sm text-sand/70 sm:text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 1.5 }}
            >
              {lang === "ar" ? "كل تعثّر إشارة، لا فشل." : "Every setback is a signal, not a failure."}
            </motion.p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute bottom-8 end-8 rounded-full border border-sand/25 px-4 py-2 text-xs tracking-widest text-sand/70 transition-colors hover:border-sand/60 hover:text-sand"
          >
            {lang === "ar" ? "تخطّي" : "Skip"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}