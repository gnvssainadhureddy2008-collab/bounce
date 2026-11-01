import { Reveal } from "@/components/landing/Reveal";

/** Scene 3 — The Cliff. Qualitative statements only: no invented statistics. */
export default function SceneCliff({ lang = "en" }) {
  const ar = lang === "ar";

  const statements = ar
    ? [
        { title: "الوعي يرتفع. العادات لا.", body: "الحملات تُشعل الاهتمام لأسابيع، ثم يعود اليوم كما كان — لأن الاهتمام ليس خطة." },
        { title: "تعثّر واحد يصبح تركًا كاملًا.", body: "حين تكون السلسلة هي كل شيء، فكسرها يعني البدء من الصفر. فلا أحد يبدأ من الصفر مرتين." },
        { title: "الخطة العامة لا تناسب أحدًا.", body: "من يعمل بالورديات، أو يصوم، أو يستخدم كرسيًا متحركًا، أو يتحدث العربية فقط — كلهم خارج النموذج الواحد." },
      ]
    : [
        { title: "Awareness spikes. Habits don't.", body: "A campaign lights up intent for a few weeks, then the day returns to what it was — because attention is not a plan." },
        { title: "One lapse becomes quitting.", body: "When the streak is everything, breaking it means starting over. Nobody starts over twice." },
        { title: "A generic plan fits no one.", body: "The shift worker, the person fasting, the wheelchair user, the Arabic-only reader — all outside the one mould." },
      ];

  const gaps = ar
    ? ["اللغة", "الثقافة", "محو الأمية الصحية", "نمط العمل", "الإعاقة", "الأسرة", "الوصول", "القدرة الشرائية"]
    : ["Language", "Culture", "Health literacy", "Work pattern", "Disability", "Family", "Access", "Cost"];

  return (
    <section id="problem" className="relative overflow-hidden border-y border-border/40 bg-[#050f13] py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(11,58,66,0.75),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-6">{ar ? "المشهد الثالث — الهاوية" : "Scene three — the cliff"}</p>
          <h2 className="display max-w-3xl text-[9vw] leading-[1] text-sand sm:text-6xl">
            {ar ? "الفجوة ليست في المعرفة." : "The gap is not knowledge."}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/40 md:grid-cols-3">
          {statements.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="group bg-[#06161c] p-8 transition-colors hover:bg-[#081e24] sm:p-10">
              <span className="display text-4xl text-aqua/40">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-heading text-lg font-medium tracking-tight text-sand">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </Reveal>
          ))}
        </div>

        {/* fragments that will not fit one mould */}
        <Reveal delay={0.15} className="mt-16">
          <div className="relative rounded-[2rem] border border-dashed border-sand/20 p-8 sm:p-10">
            <span className="eyebrow">{ar ? "ثمانية أشياء لا تدخل قالبًا واحدًا" : "Eight things that never fit one mould"}</span>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {gaps.map((g, i) => (
                <span
                  key={g}
                  className="rounded-full border border-sand/15 bg-sand/[0.03] px-4 py-2 text-[13px] text-sand/70 transition-transform duration-500 hover:-translate-y-0.5 hover:border-aqua/50 hover:text-sand"
                  style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {ar
                ? "لهذا لا يكفي برنامج واحد للجميع. ما يناسب شخصًا واحدًا في سياقه لن يناسب الآخر — والفارق ليس في الإرادة."
                : "Which is why one programme for everyone fails. What fits one person in one context will not fit the next — and the difference is not willpower."}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}