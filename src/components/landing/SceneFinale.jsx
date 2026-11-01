import { motion, useReducedMotion } from "framer-motion";
import GoogleButton from "@/components/brand/GoogleButton";
import Wordmark from "@/components/brand/Wordmark";
import { MaskLines, Reveal } from "@/components/landing/Reveal";

/** Scene 9 — Finale and footer. The five challenge outcomes, mapped honestly. */
export default function SceneFinale({ lang = "en", onSignIn, onGuest, onImpact, onLang }) {
  const ar = lang === "ar";
  const reduce = useReducedMotion();

  const outcomes = ar
    ? [
        { k: "أهداف وبيانات ← خطوات صغيرة قابلة للتنفيذ", d: "خطوة واحدة يوميًا بحجم الوقت المتاح فعلًا." },
        { k: "يتعلّم ما ينفع لكل شخص", d: "عصابات سياقية (Thompson sampling) تُحدَّث من كل تسجيل." },
        { k: "تعافٍ بلا لوم", d: "التعثّر لا يعيد التقدّم إلى الصفر، ويُكافأ التعافي." },
        { k: "قياس التغيير المستدام", d: "الثبات مع أيام سماح، وسرعة التعافي، لا التنزيلات." },
        { k: "إنصاف عبر السياقات", d: "اللغة والثقافة والصيام والورديات والإعاقة والوصول." },
      ]
    : [
        { k: "Goals and data become small feasible actions", d: "One daily step sized to the time you actually have." },
        { k: "Learns what works for each person", d: "A contextual bandit (Thompson sampling) updated by every log." },
        { k: "No-blame recovery", d: "A lapse never resets progress, and recovery is what gets rewarded." },
        { k: "Measures sustained change", d: "Consistency with grace days and recovery speed — not downloads." },
        { k: "Equitable across contexts", d: "Language, culture, fasting, shift work, disability and access." },
      ];

  return (
    <footer className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#04121a_0%,#12383c_46%,#8a5136_78%,#ffb86b_100%)]" />
        <div className="absolute bottom-[18%] left-1/2 h-[50vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-amber/35 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-24 sm:px-8 sm:pt-32">
        <div className="text-center">
          <h2 className="display text-[11vw] leading-[0.98] text-[#0a2027] sm:text-6xl">
            <MaskLines lines={ar ? ["ابدأ صغيرًا.", "وعُد في أي وقت."] : ["Start small.", "Come back anytime."]} />
          </h2>
          <Reveal delay={0.3} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <GoogleButton onClick={onSignIn} label={ar ? "المتابعة عبر Google" : "Continue with Google"} />
            <button
              type="button"
              onClick={onGuest}
              className="rounded-full border border-[#0a2027]/30 px-6 py-3.5 text-sm text-[#0a2027]/85 transition-transform duration-300 hover:-translate-y-0.5"
            >
              {ar ? "التجربة كزائر" : "Try as guest"}
            </button>
            <button type="button" onClick={onImpact} className="text-sm text-[#0a2027]/60 underline underline-offset-[6px]">
              {ar ? "لوحة الأثر" : "See the impact dashboard"}
            </button>
          </Reveal>
        </div>

        {/* horizon with the figure arriving */}
        <div aria-hidden="true" className="relative mx-auto mt-20 h-28 max-w-4xl">
          <div className="absolute inset-x-0 bottom-6 h-px bg-[#0a2027]/25" />
          <motion.svg
            viewBox="0 0 800 100"
            className="absolute bottom-6 left-1/2 h-20 w-24 -translate-x-1/2"
            animate={reduce ? undefined : { y: [0, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <g fill="#08202a">
              <ellipse cx="40" cy="78" rx="26" ry="2.6" opacity="0.5" />
              <circle cx="42" cy="24" r="6" />
              <path d="M42 32c-3 6-4 12-3 18 1 5 3 8 3 12 0 6-1 10-2 16h4l4-14 5 14h4c-2-8-3-12-3-18 0-5 2-8 3-12 1-7-2-13-5-16z" />
            </g>
          </motion.svg>
        </div>

        <div className="mt-16 rounded-3xl border border-[#0a2027]/15 bg-[#06181e]/85 p-6 backdrop-blur-md sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Wordmark />
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-sand/40">
              <button type="button" onClick={onLang} className="rounded-full border border-sand/20 px-3 py-1 hover:text-sand">
                {ar ? "English" : "العربية"}
              </button>
              <span className="hidden sm:inline">{ar ? "منظومة الصحة · أبوظبي" : "Abu Dhabi health ecosystem"}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {outcomes.map((o, i) => (
              <div key={o.k} className="border-t border-sand/10 pt-4">
                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-aqua/70">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[12px] font-medium leading-snug text-sand/85">{o.k}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-sand/45">{o.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-sand/10 pt-6 text-[11px] leading-relaxed text-sand/40 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-xl">
              {ar
                ? "باونس ليس خدمة تشخيص أو علاج. لا يقدم تشخيصًا طبيًا ولا ادعاءات علاجية. للإقلاع عن التدخين أو الألم المستمر، تحدّث مع طبيب أو خط المساعدة الوطني."
                : "Bounce is not a diagnostic or treatment service. It makes no medical diagnosis and no clinical claims. For smoking cessation or persistent pain, speak with a clinician or your national quitline."}
            </p>
            <p className="shrink-0">© {new Date().getFullYear()} Bounce</p>
          </div>
        </div>
      </div>
    </footer>
  );
}