import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Wordmark from "@/components/brand/Wordmark";
import GoogleButton from "@/components/brand/GoogleButton";
import { MaskLines, Reveal } from "@/components/landing/Reveal";

const COPY = {
  en: {
    eyebrow: "Behaviour change · Abu Dhabi health ecosystem",
    title: ["Every setback", "is a signal,", "not a failure."],
    body: "Bounce turns one goal into one small action a day — then learns, week after week, what actually works for you. A missed day is information. It never resets your progress.",
    google: "Continue with Google",
    guest: "Try as guest",
    impact: "See the impact dashboard",
    scroll: "Scroll slowly",
    nav: ["The problem", "How it works", "Who it's for", "Evidence"],
    signin: "Sign in",
  },
  ar: {
    eyebrow: "تغيير السلوك · منظومة الصحة في أبوظبي",
    title: ["كل تعثّر", "إشارة،", "لا فشل."],
    body: "يحوّل باونس هدفًا واحدًا إلى خطوة صغيرة كل يوم — ثم يتعلّم أسبوعًا بعد أسبوع ما يناسبك فعلًا. اليوم الفائت معلومة، ولا يعيد تقدّمك إلى الصفر.",
    google: "المتابعة عبر Google",
    guest: "التجربة كزائر",
    impact: "لوحة الأثر",
    scroll: "مرّر بهدوء",
    nav: ["المشكلة", "كيف يعمل", "لمن", "الأدلة"],
    signin: "تسجيل الدخول",
  },
};

export default function Hero({ lang = "en", onSignIn, onGuest, onImpact, onLang }) {
  const c = COPY[lang] ?? COPY.en;
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <header ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {/* dawn sky */}
      <motion.div
        aria-hidden="true"
        style={{ y: skyY }}
        className="pointer-events-none absolute inset-0 -bottom-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_112%,rgba(255,138,92,0.55)_0%,rgba(255,184,107,0.28)_26%,rgba(11,58,66,0.5)_52%,rgba(6,22,28,1)_78%)]" />
        <div className="absolute inset-x-0 bottom-[26%] h-px bg-gradient-to-r from-transparent via-coral/60 to-transparent" />
        <div className="absolute left-1/2 top-[64%] h-[38vmin] w-[38vmin] -translate-x-1/2 rounded-full bg-amber/25 blur-[90px]" />
      </motion.div>

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-6 sm:px-8">
        <a href="#top" className="rounded-full" aria-label="Bounce — home">
          <Wordmark />
        </a>
        <div className="hidden items-center gap-8 text-[13px] text-sand/60 lg:flex">
          {["#problem", "#how", "#who", "#evidence"].map((href, i) => (
            <a key={href} href={href} className="transition-colors hover:text-sand">{c.nav[i]}</a>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onLang}
            className="rounded-full border border-sand/20 px-3 py-1.5 text-[11px] tracking-widest text-sand/70 transition-colors hover:border-sand/50 hover:text-sand"
            aria-label={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
          >
            {lang === "en" ? "ع" : "EN"}
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="hidden rounded-full px-4 py-2 text-[13px] text-sand/75 transition-colors hover:text-sand sm:block"
          >
            {c.signin}
          </button>
        </div>
      </nav>

      <motion.div
        style={{ y: titleY, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[84svh] max-w-6xl flex-col justify-center px-5 pb-24 sm:px-8"
      >
        <Reveal>
          <p className="eyebrow mb-6">{c.eyebrow}</p>
        </Reveal>
        <h1 className="display text-[13.5vw] leading-[0.92] text-sand sm:text-[9vw] lg:text-[7.4rem]">
          <MaskLines lines={c.title} delay={0.05} />
        </h1>
        <Reveal delay={0.55} className="mt-8 max-w-xl">
          <p className="text-[15px] leading-relaxed text-sand/70 sm:text-lg">{c.body}</p>
        </Reveal>

        <Reveal delay={0.7} className="mt-10 flex flex-wrap items-center gap-4">
          <GoogleButton onClick={onSignIn} label={c.google} />
          <button
            type="button"
            onClick={onGuest}
            className="rounded-full border border-sand/25 px-6 py-3.5 text-sm text-sand/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-aqua/70 hover:text-sand"
          >
            {c.guest}
          </button>
          <button
            type="button"
            onClick={onImpact}
            className="text-sm text-sand/55 underline decoration-sand/25 underline-offset-[6px] transition-colors hover:text-sand/90"
          >
            {c.impact}
          </button>
        </Reveal>
      </motion.div>

      {/* horizon walker */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40">
        <svg viewBox="0 0 1200 160" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0 150 H1200" stroke="rgba(232,213,183,0.22)" strokeWidth="1" />
          <g fill="#040f13">
            <ellipse cx="600" cy="149" rx="120" ry="3.5" opacity="0.6" />
            <path d="M600 149c-2-9 0-19 1-25 1-5 4-9 3-14-1-4-4-6-3-10 1-5 6-6 7-3 1 3-1 5 0 8 1 4 4 7 4 12 0 7 1 19 0 32z" />
            <circle cx="605" cy="94" r="4.6" />
          </g>
        </svg>
      </div>

      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-sand/40"
      >
        <span>{c.scroll}</span>
        <motion.span
          className="h-10 w-px bg-gradient-to-b from-sand/50 to-transparent"
          animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </header>
  );
}