/**
 * Synthetic cohort for the programme view — 2,000 generated people.
 * Deterministic (fixed seed) so the charts never jump between renders, and
 * clearly labelled as demonstration data everywhere it appears. Never presented
 * as real participants, and never used to make a clinical claim.
 */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, values, weights) => {
  const r = rand();
  let acc = 0;
  for (let i = 0; i < values.length; i++) {
    acc += weights[i];
    if (r <= acc) return values[i];
  }
  return values[values.length - 1];
};

export const AGES = ["18-29", "30-44", "45-59", "60+"];
export const WORKS = ["office", "shifts", "remote"];
export const ACCESS = ["none", "large", "screenreader", "mobility"];
export const REGIONS = ["Abu Dhabi", "Al Ain", "Dubai", "Sharjah"];

let cached = null;

export function buildCohort(n = 2000) {
  if (cached && cached.length === n) return cached;
  const rand = mulberry32(20261101);
  const users = [];
  for (let i = 0; i < n; i++) {
    const lang = rand() < 0.38 ? "ar" : "en";
    const age = pick(rand, AGES, [0.28, 0.4, 0.22, 0.1]);
    const work = pick(rand, WORKS, [0.5, 0.27, 0.23]);
    const access = rand() < 0.16 ? pick(rand, ["large", "screenreader", "mobility"], [0.5, 0.2, 0.3]) : "none";
    const region = pick(rand, REGIONS, [0.46, 0.2, 0.22, 0.12]);

    let p = 0.6;
    if (lang === "ar") p -= 0.08;
    if (work === "shifts") p -= 0.07;
    if (access !== "none") p -= 0.06;
    if (age === "60+") p -= 0.06;
    if (age === "18-29") p -= 0.02;
    p = Math.max(0.22, Math.min(0.88, p));

    const persisted = rand() < p;
    const weeks = persisted ? 9 + Math.floor(rand() * 4) : Math.floor(rand() * 9);
    const lapsed = rand() < 0.64;
    const recoveredDays = lapsed ? 1 + Math.floor(rand() * 15) : null;
    const behaviorChange = Math.round((persisted ? 12 : -2) + rand() * 15);

    users.push({
      id: i,
      lang,
      age,
      work,
      access,
      region,
      weeks,
      recoveredDays,
      behaviorChange,
      // one row per synthetic person keeps the CSV honest about n
      active: weeks >= 12,
    });
  }
  cached = users;
  return users;
}

export function applyFilters(users, f = {}) {
  return users.filter(
    (u) =>
      (!f.lang || f.lang === "all" || u.lang === f.lang) &&
      (!f.work || f.work === "all" || u.work === f.work) &&
      (!f.access || f.access === "all" || u.access === f.access) &&
      (!f.age || f.age === "all" || u.age === f.age) &&
      (!f.region || f.region === "all" || u.region === f.region),
  );
}

export function summarise(users) {
  const n = users.length || 1;
  const persistence = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    persistence: Math.round((users.filter((u) => u.weeks >= i + 1).length / n) * 100),
  }));
  const withLapse = users.filter((u) => u.recoveredDays != null);
  const recovered7 = withLapse.length
    ? Math.round((withLapse.filter((u) => u.recoveredDays <= 7).length / withLapse.length) * 100)
    : 0;
  const behavior = users.length
    ? Number((users.reduce((s, u) => s + u.behaviorChange, 0) / users.length).toFixed(1))
    : 0;
  return {
    count: users.length,
    persistence,
    recovered7,
    behavior,
    retention: persistence.map((p) => ({ week: p.week, retention: p.persistence })),
  };
}

const DIMENSIONS = [
  { key: "lang", label: { en: "Language", ar: "اللغة" } },
  { key: "age", label: { en: "Age band", ar: "الفئة العمرية" } },
  { key: "work", label: { en: "Work pattern", ar: "نمط العمل" } },
  { key: "access", label: { en: "Accessibility mode", ar: "وضع الوصول" } },
  { key: "region", label: { en: "Region", ar: "المنطقة" } },
];

const FIX = {
  lang: { en: "Arabic-first layout and Arabic-only reminders for this group.", ar: "واجهة عربية أولًا وتذكيرات بالعربية لهذه الفئة." },
  age: { en: "One card a day, larger type, and family-assisted onboarding.", ar: "بطاقة واحدة يوميًا ونص أكبر وتسجيل بمساعدة العائلة." },
  work: { en: "Rotate timing with the rota and anchor sleep after night shifts.", ar: "تدوير التوقيت مع الورديات وتثبيت النوم بعد ورديات الليل." },
  access: { en: "Seated movement options and a screen-reader-first action card.", ar: "خيارات حركة جلوس وبطاقة خطوة متوافقة مع قارئ الشاشة أولًا." },
  region: { en: "Local walking routes and an in-person circle in this region.", ar: "مسارات مشي محلية وحلقة حضورية في هذه المنطقة." },
};

/** The lagging subgroup per dimension, with a suggested fix. Small groups are suppressed. */
export function equityView(users) {
  return DIMENSIONS.map((dim) => {
    const groups = {};
    for (const u of users) {
      const k = u[dim.key];
      groups[k] = groups[k] || { key: k, n: 0, retained: 0 };
      groups[k].n++;
      if (u.active) groups[k].retained++;
    }
    const eligible = Object.values(groups).filter((g) => g.n >= 20);
    if (!eligible.length) return { dimension: dim, lagging: null };
    eligible.sort((a, b) => a.retained / a.n - b.retained / b.n);
    const worst = eligible[0];
    return {
      dimension: dim,
      lagging: {
        key: worst.key,
        n: worst.n,
        retention: Math.round((worst.retained / worst.n) * 100),
        fix: FIX[dim.key],
      },
    };
  });
}

/** Aggregate CSV — never a per-person export for a programme view. */
export function toCsv(users, filters) {
  const s = summarise(users);
  const lines = [["metric", "value", "n"]];
  lines.push(["filtered_cohort", s.count, s.count]);
  lines.push(["sustained_week_12_pct", s.persistence[11].persistence, s.count]);
  lines.push(["recovered_within_7_days_pct", s.recovered7, s.count]);
  lines.push(["mean_target_behaviour_change_points", s.behavior, s.count]);
  for (const row of s.persistence) lines.push([`persistence_${row.week}_pct`, row.persistence, s.count]);
  for (const [k, v] of Object.entries(filters || {})) lines.push([`filter_${k}`, v || "all", ""]);
  return lines.map((r) => r.join(",")).join("\n");
}