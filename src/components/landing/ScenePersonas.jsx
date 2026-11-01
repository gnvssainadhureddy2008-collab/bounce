/** Scene 6 — Built for everyone. Six real contexts, and how the plan changes for each. */
export default function ScenePersonas({ lang = "en", onLang }) {
  const ar = lang === "ar";

  const people = ar
    ? [
        { name: "أمل", role: "ممرضة في ورديات ليلية", text: "نومها يتحرك كل أسبوع.", adapt: ["حركة قبل الوردية", "نافذة نوم ثابتة بعد الوردية", "لا تذكير أثناء النوم"] },
        { name: "مريم", role: "أم لطفل رضيع", text: "لا وقت متصل في يومها.", adapt: ["خطوات دقيقتين", "لا رسائل ليلية", "قيلولة بدل التمرين"] },
        { name: "يوسف", role: "مستخدم كرسي متحرك", text: "التمارين المعتادة لا تناسبه.", adapt: ["حركة جلوس", "تمارين الجزء العلوي", "أماكن يمكن الوصول إليها"] },
        { name: "أبو سالم", role: "متقاعد يتحدث العربية", text: "الواجهة الإنجليزية تعني الخروج.", adapt: ["عربية كاملة واتجاه RTL", "نص كبير", "مشي بعد الفجر"] },
        { name: "ليلى", role: "موظفة في رمضان", text: "الصيام يغيّر كل توقيت.", adapt: ["خطوات بعد الإفطار", "ماء بين المغرب والسحور", "لا حركة ظهرًا"] },
        { name: "عمر", role: "يقلع عن التدخين", text: "الرغبة تأتي في دقائق.", adapt: ["مدرب رغبة ٣ دقائق", "تأخير بدل منع", "عداد مدخرات وخط مساعدة"] },
      ]
    : [
        { name: "Amal", role: "Nurse on rotating nights", text: "Her sleep moves every week.", adapt: ["Movement before the shift", "Fixed sleep window after it", "No nudges while asleep"] },
        { name: "Mariam", role: "New mother", text: "She has no unbroken hour.", adapt: ["Two-minute actions", "No night messages", "Rest counts as a step"] },
        { name: "Yusuf", role: "Wheelchair user", text: "Standard exercise advice doesn't apply.", adapt: ["Seated mobility", "Upper-body options", "Step-free routes"] },
        { name: "Abu Salim", role: "Arabic-speaking retiree", text: "An English interface means exit.", adapt: ["Full Arabic, RTL layout", "Larger text", "Walk after Fajr"] },
        { name: "Layla", role: "Office worker during Ramadan", text: "Fasting rewrites the clock.", adapt: ["Actions after iftar", "Water between maghrib and suhoor", "No midday exertion"] },
        { name: "Omar", role: "Quitting smoking", text: "A craving peaks in minutes.", adapt: ["3-minute craving coach", "Delay, not denial", "Savings counter and quitline"] },
      ];

  return (
    <section id="who" className="relative overflow-hidden bg-[#051419] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">{ar ? "المشهد السادس — للجميع" : "Scene six — built for everyone"}</p>
            <h2 className="display text-[10vw] leading-[0.98] text-sand sm:text-5xl">
              {ar ? "سياق واحد لا يكفي." : "One context is not enough."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onLang}
            className="group flex items-center gap-3 rounded-full border border-sand/25 px-5 py-2.5 text-xs tracking-wide text-sand/80 transition-colors hover:border-aqua/60 hover:text-sand"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-aqua transition-transform group-hover:scale-125" />
            {ar ? "اقرأ بالإنجليزية" : "اقرأ بالعربية — اقلب الصفحة"}
          </button>
        </div>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {ar
            ? "الخطة نفسها لا تصلح للجميع. المحرك يغيّر الحجم والتوقيت واللغة وقناة التواصل بحسب السياق — لا بحسب الشخص «المثالي»."
            : "The same plan does not suit everyone. The engine changes size, timing, language and channel to fit the context — not the “ideal” person."}
        </p>
      </div>

      <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:px-8 [scrollbar-width:thin]">
        {people.map((p, i) => (
          <article
            key={p.name}
            className="group w-[80%] shrink-0 snap-start rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-colors hover:border-aqua/35 sm:w-[46%] lg:w-[31%]"
          >
            <div className="flex items-center justify-between">
              <span className="display text-3xl text-sand">{p.name}</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-sand/30">0{i + 1}</span>
            </div>
            <p className="mt-1 text-[12px] text-aqua/70">{p.role}</p>
            <p className="mt-4 text-sm leading-relaxed text-sand/60">{p.text}</p>
            <ul className="mt-5 space-y-2">
              {p.adapt.map((a) => (
                <li key={a} className="flex items-start gap-2 text-[12px] text-sand/75">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aqua/70" />
                  {a}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}