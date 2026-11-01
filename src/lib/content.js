/**
 * Bounce — coaching content, technique rationales and bilingual action copy.
 * Every action the engine can choose is generated from this library, so the
 * same variant always maps to the same sentence in both languages.
 */

export const BEHAVIORS = ["movement", "nutrition", "sleep", "smoking"];

export const BEHAVIOR_META = {
  movement: {
    label: { en: "Movement", ar: "الحركة" },
    blurb: {
      en: "Micro-walks, seated options and low-mobility variations. Never a gym requirement.",
      ar: "مشي قصير جدًا، وخيارات جلوس، وتنويعات لحركة محدودة. لا يشترط صالة رياضية.",
    },
  },
  nutrition: {
    label: { en: "Nutrition", ar: "التغذية" },
    blurb: {
      en: "Small swaps built around the food you already eat: water, vegetables, portion rhythm.",
      ar: "تبديلات صغيرة حول طعامك المعتاد: الماء، الخضار، إيقاع الحصص.",
    },
  },
  sleep: {
    label: { en: "Sleep", ar: "النوم" },
    blurb: {
      en: "A regular schedule and a wind-down you can keep, including after night shifts.",
      ar: "موعد منتظم وتهدئة يمكنك الالتزام بها، حتى بعد ورديات الليل.",
    },
  },
  smoking: {
    label: { en: "Quitting smoking", ar: "الإقلاع عن التدخين" },
    blurb: {
      en: "Delay, breathe, distract — with a quitline path for anything harder than a craving.",
      ar: "أخّر، تنفّس، اشغل نفسك — مع مسار لخط مساعدة لما هو أصعب من الرغبة.",
    },
  },
};

/** Action copy by behaviour × size. `ar` strings are written, not transliterated. */
export const ACTIONS = {
  movement: {
    micro: {
      title: { en: "Stand up and walk for 3 minutes", ar: "قف وامشِ ٣ دقائق" },
      seated: { en: "Seated: 10 slow shoulder rolls and 10 ankle circles", ar: "جلوسًا: ١٠ دورات كتف بطيئة و١٠ دوائر كاحل" },
    },
    small: {
      title: { en: "A 10-minute walk at an easy pace", ar: "مشي ١٠ دقائق بخطى مريحة" },
      seated: { en: "10 minutes of seated mobility at your desk", ar: "١٠ دقائق حركة جلوس عند مكتبك" },
    },
    medium: {
      title: { en: "A 25-minute brisk walk before the heat", ar: "مشي ٢٥ دقيقة بخطى سريعة قبل الحرّ" },
      seated: { en: "20 minutes of low-impact movement at home", ar: "٢٠ دقيقة حركة خفيفة في المنزل" },
    },
  },
  nutrition: {
    micro: {
      title: { en: "Drink one glass of water now", ar: "اشرب كوب ماء الآن" },
      seated: { en: "Put a water bottle within arm's reach", ar: "ضع زجاجة ماء في متناول يدك" },
    },
    small: {
      title: { en: "Add one vegetable or salad to a meal today", ar: "أضف خضارًا أو سلطة إلى وجبة اليوم" },
      seated: { en: "Swap one sweet drink for water or mint tea", ar: "استبدل مشروبًا حلوًا بالماء أو شاي النعناع" },
    },
    medium: {
      title: { en: "Build one balanced plate: half vegetables, quarter protein, quarter carbs", ar: "اصنع طبقًا متوازنًا: نصفه خضار وربعه بروتين وربعه نشويات" },
      seated: { en: "Plan tomorrow's meals around what is already in the kitchen", ar: "خطّط لوجبات الغد من مكونات مطبخك" },
    },
  },
  sleep: {
    micro: {
      title: { en: "Dim the lights 30 minutes before bed", ar: "خفّف الإضاءة ٣٠ دقيقة قبل النوم" },
      seated: { en: "Put the phone out of reach for 10 minutes before bed", ar: "أبعد الهاتف ١٠ دقائق قبل النوم" },
    },
    small: {
      title: { en: "Set a fixed wind-down alarm", ar: "اضبط منبّه تهدئة بوقت ثابت" },
      seated: { en: "Three slow breaths in bed, then lights out", ar: "ثلاثة أنفاس بطيئة في السرير ثم أطفئ الضوء" },
    },
    medium: {
      title: { en: "A screen-free wind-down, 30 minutes, same time tonight", ar: "تهدئة بلا شاشات، ٣٠ دقيقة، بنفس الوقت الليلة" },
      seated: { en: "Keep a consistent sleep window, even after a late shift", ar: "حافظ على نافذة نوم ثابتة حتى بعد وردية متأخرة" },
    },
  },
  smoking: {
    micro: {
      title: { en: "Delay the next cigarette by 3 minutes and breathe", ar: "أخّر السيجارة التالية ٣ دقائق وتنفّس" },
      seated: { en: "Log one craving instead of acting on it", ar: "سجّل رغبة واحدة بدل الاستجابة لها" },
    },
    small: {
      title: { en: "Replace one cigarette with a 3-minute breathing break", ar: "استبدل سيجارة واحدة باستِراحة تنفّس ٣ دقائق" },
      seated: { en: "Change one trigger routine — tea outside becomes tea inside", ar: "غيّر روتين محفّز واحد — الشاي في الخارج يصبح في الداخل" },
    },
    medium: {
      title: { en: "A full smoke-free block until your next prayer or break", ar: "فترة كاملة بلا تدخين حتى الصلاة أو الاستراحة التالية" },
      seated: { en: "Tell one person your quit date today", ar: "أخبر شخصًا واحدًا بتاريخ إقلاعك اليوم" },
    },
  },
};

/** Techniques surfaced in "Why am I seeing this?" */
export const TECHNIQUES = {
  implementation_intentions: {
    label: { en: "Implementation intentions", ar: "نوايا التنفيذ" },
    evidence: {
      en: "Moderate-to-strong evidence across behaviour-change research: naming a concrete cue (“after Fajr, I walk”) raises follow-through more than intention alone.",
      ar: "أدلة متوسطة إلى قوية في أبحاث تغيير السلوك: تحديد محفّز ملموس («بعد الفجر أمشي») يرفع الالتزام أكثر من النية وحدها.",
    },
    limits: {
      en: "Weak if the cue is unreliable — shift changes and travel break it, so Bounce re-anchors the cue after a disruption.",
      ar: "يضعف إذا كان المحفّز غير ثابت — الورديات والسفر يكسرانه، لذلك يعيد باونس تثبيت المحفّز بعد التعطّل.",
    },
  },
  self_monitoring: {
    label: { en: "Self-monitoring", ar: "المراقبة الذاتية" },
    evidence: {
      en: "One of the most consistently effective techniques in the behaviour-change literature, especially combined with feedback.",
      ar: "من أكثر الأساليب ثباتًا في فعاليتها في أدبيات تغيير السلوك، خصوصًا مع التغذية الراجعة.",
    },
    limits: {
      en: "Logging itself can feel like a chore; that is why the log is one tap and never a requirement to keep your progress.",
      ar: "قد يصبح التسجيل عبئًا؛ لذلك هو نقرة واحدة، وليس شرطًا للحفاظ على تقدّمك.",
    },
  },
  habit_stacking: {
    label: { en: "Habit stacking", ar: "تركيب العادات" },
    evidence: {
      en: "Anchoring a new action to an existing routine reduces the planning load each day.",
      ar: "ربط سلوك جديد بروتين قائم يقلّل عبء التخطيط اليومي.",
    },
    limits: {
      en: "Works best when the existing routine is genuinely daily; Bounce checks whether the anchor held.",
      ar: "يعمل أفضل حين يكون الروتين القائم يوميًا فعلًا؛ ويتحقق باونس من ثبات المرساة.",
    },
  },
  goal_setting: {
    label: { en: "Graded goal setting", ar: "تحديد أهداف متدرّج" },
    evidence: {
      en: "Specific, moderately difficult goals outperform vague ones — but only when the person sets the size.",
      ar: "الأهداف المحددة والمعتدلة الصعوبة تتفوق على الغامضة — لكن فقط حين يحدد الشخص الحجم.",
    },
    limits: {
      en: "If a goal is set too large it backfires; the “Smaller please” control exists precisely for that.",
      ar: "إذا كان الهدف أكبر من اللازم ينعكس سلبًا؛ ولهذا وُجد زر «أصغر من فضلك».",
    },
  },
  com_b: {
    label: { en: "COM-B barrier mapping", ar: "خريطة عوائق COM-B" },
    evidence: {
      en: "A widely used framework: behaviour needs capability, opportunity and motivation together, so the plan changes whichever one is missing.",
      ar: "إطار واسع الاستخدام: السلوك يحتاج القدرة والفرصة والدافع معًا، فتتغيّر الخطة حسب المفقود.",
    },
    limits: {
      en: "It explains the barrier, not the medical cause. Pain or low mood that persists deserves a clinician.",
      ar: "يفسّر العائق لا السبب الطبي. الألم أو المزاج المنخفض المستمر يستحق مراجعة طبيب.",
    },
  },
};

export const EFFORT_LABEL = {
  easy: { en: "easy", ar: "سهل" },
  medium: { en: "manageable", ar: "مقبول" },
  hard: { en: "hard", ar: "صعب" },
};

export const TEXT = (v, lang) => (v ? v[lang] ?? v.en : "");