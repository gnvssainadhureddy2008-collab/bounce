/**
 * Bounce — the adaptive behaviour-change engine.
 *
 * Real logic, no mock-ups:
 *  · a per-user contextual bandit (Thompson sampling over Beta posteriors) chooses
 *    action size, timing, tone and channel every day,
 *  · every logged outcome updates the posterior for each dimension,
 *  · a lapse detector combines missed days, declining effort and ignored nudges,
 *  · resilience is scored over a rolling window with grace days, so it never resets.
 */

import { ACTIONS } from "@/lib/content";

export const DIMENSIONS = ["size", "timing", "tone", "channel"];
export const VARIANTS = {
  size: ["micro", "small", "medium"],
  timing: ["morning", "midday", "evening"],
  tone: ["gentle", "direct", "playful"],
  channel: ["app", "whatsapp", "sms", "coach"],
};

export const SLOTS = {
  office: { morning: "07:30", midday: "13:00", evening: "19:30" },
  shifts: { morning: "06:30", midday: "14:30", evening: "22:00" },
  remote: { morning: "08:30", midday: "12:30", evening: "20:00" },
};

/* ---------- dates ---------- */
export const isoDate = (d = new Date()) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 10);
};
export const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
export const daysBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);
export const weekdayShort = (iso, lang) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", { weekday: "short" });

/* ---------- Thompson sampling ---------- */
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function gamma(shape) {
  if (shape < 1) return gamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do {
      x = gauss();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
const betaDraw = (successes, trials) => {
  const a = 1 + Math.max(0, successes);
  const b = 1 + Math.max(0, trials - successes);
  const x = gamma(a), y = gamma(b);
  return x / (x + y);
};

/** Flatten persisted bandit rows into a lookup keyed "dimension:variant". */
export function statsMap(rows = []) {
  const map = {};
  for (const r of rows) map[`${r.dimension}:${r.variant}`] = { successes: r.successes || 0, trials: r.trials || 0, id: r.id };
  return map;
}
const posterior = (map, dim, variant) => map[`${dim}:${variant}`] || { successes: 0, trials: 0 };

/** Pick the variant with the highest sampled posterior among the allowed ones. */
export function chooseVariant(map, dim, allowed = VARIANTS[dim]) {
  let best = allowed[0], bestDraw = -1;
  for (const v of allowed) {
    const st = posterior(map, dim, v);
    const draw = betaDraw(st.successes, st.trials);
    if (draw > bestDraw) { bestDraw = draw; best = v; }
  }
  return best;
}

/** The most successful variant so far (for the Insights screen). */
export function bestVariant(map, dim) {
  let best = null;
  for (const v of VARIANTS[dim]) {
    const st = posterior(map, dim, v);
    const mean = (st.successes + 1) / (st.trials + 2);
    if (st.trials > 0 && (!best || mean > best.mean)) best = { variant: v, mean, ...st };
  }
  return best;
}

/** Sizes the person has capacity for, given the minutes they offered. */
export function allowedSizes(minutes = 10) {
  if (minutes <= 5) return ["micro"];
  if (minutes <= 15) return ["micro", "small"];
  return ["micro", "small", "medium"];
}

/* ---------- plan composition ---------- */
function shiftTiming(timing, dayIndex, workPattern) {
  if (workPattern !== "shifts") return timing;
  const rotation = ["morning", "midday", "evening"];
  return rotation[(rotation.indexOf(timing) + dayIndex) % 3];
}

/**
 * Compose one action: bandit variants → concrete, culturally aware instruction.
 */
export function composeAction({ goal, map, lang = "en", dayIndex = 0, accessibility = {} }) {
  const sizes = allowedSizes(goal.minutes_per_day);
  const size = chooseVariant(map, "size", sizes);
  let timing = chooseVariant(map, "timing");
  const tone = chooseVariant(map, "tone");
  const channel = chooseVariant(map, "channel");

  let note = null;
  if (goal.fasting_aware && timing === "midday") {
    timing = "evening";
    note = { en: "Fasting-aware: moved after sunset instead of midday.", ar: "يراعي الصيام: نُقل بعد الغروب بدل الظهيرة." };
  }
  const heated = ["05", "06", "07", "08", "09"].includes(isoDate().slice(5, 7));
  if (goal.behavior === "movement" && heated && timing === "midday") {
    timing = "morning";
    note = { en: "Heat-aware: outdoor movement moved before 9am.", ar: "يراعي الحرارة: نُقلت الحركة الخارجية قبل التاسعة صباحًا." };
  }
  timing = shiftTiming(timing, dayIndex, goal.work_pattern);

  const seated = accessibility.mobility || size === "micro";
  const pool = ACTIONS[goal.behavior][size];
  const title = seated ? pool.seated : pool.title;

  return {
    behavior: goal.behavior,
    size,
    timing,
    tone,
    channel,
    time: (SLOTS[goal.work_pattern] || SLOTS.office)[timing],
    title: title[lang] || title.en,
    technique: size === "medium" ? "goal_setting" : timing === "morning" ? "implementation_intentions" : "self_monitoring",
    note: note ? note[lang] || note.en : "",
  };
}

/** Seven days, behaviours balanced round-robin so one goal never dominates. */
export function buildWeek({ goals, map, startDate, lang, accessibility = {} }) {
  const active = goals.filter((g) => g.status !== "done");
  if (!active.length) return [];
  const out = [];
  for (let i = 0; i < 7; i++) {
    const goal = active[i % active.length];
    const action = composeAction({ goal, map, lang, dayIndex: i, accessibility });
    out.push({ ...action, date: addDays(startDate, i), status: "planned" });
  }
  return out;
}

/* ---------- adaptation after a barrier ---------- */
export const BARRIERS = [
  "no_time", "tired", "pain", "travel", "fasting", "heat", "family", "low_mood", "forgot",
];

export const ADAPTATIONS = {
  no_time: { size: "micro", timing: "evening", tone: "gentle", note: { en: "Shortened to the smallest version, moved to a calmer slot.", ar: "قُلّصت إلى أصغر نسخة، ونُقلت إلى وقت أهدأ." } },
  tired: { size: "micro", timing: "morning", tone: "gentle", note: { en: "Smaller, and earlier — before the day takes your energy.", ar: "أصغر وأبكر — قبل أن يأخذ اليوم طاقتك." } },
  pain: { size: "micro", timing: "midday", tone: "gentle", note: { en: "Seated, low-impact version. Pain that persists is worth a clinician.", ar: "نسخة جلوس منخفضة الجهد. الألم المستمر يستحق مراجعة طبيب." } },
  travel: { size: "micro", timing: "morning", tone: "direct", note: { en: "Portable version, no equipment, works in a hotel room.", ar: "نسخة محمولة بلا أدوات، تصلح في غرفة فندق." } },
  fasting: { size: "micro", timing: "evening", tone: "gentle", note: { en: "Moved after sunset so it does not compete with fasting.", ar: "نُقلت بعد الغروب حتى لا تزاحم الصيام." } },
  heat: { size: "micro", timing: "morning", tone: "direct", note: { en: "Indoors or before 9am — the heat is not a fair test of you.", ar: "داخليًا أو قبل التاسعة — الحرّ ليس اختبارًا لعدالتك." } },
  family: { size: "micro", timing: "evening", tone: "playful", note: { en: "Small enough to fit beside family duties, or to do together.", ar: "صغيرة بما يكفي لتسع بجانب واجبات العائلة، أو تُفعل معًا." } },
  low_mood: { size: "micro", timing: "midday", tone: "gentle", note: { en: "Reduced to a two-minute version. Low mood is not a discipline problem.", ar: "خُفّضت إلى نسخة دقيقتين. المزاج المنخفض ليس مشكلة انضباط." } },
  forgot: { size: "small", timing: "morning", tone: "direct", note: { en: "Anchored to a daily routine and a reminder 10 minutes before.", ar: "رُبطت بروتين يومي وتذكير قبلها ١٠ دقائق." } },
};

/** Apply a barrier to an action, returning the adapted action (progress untouched). */
export function adaptAction(action, barrier, lang = "en", goal) {
  const a = ADAPTATIONS[barrier] || ADAPTATIONS.no_time;
  const size = action.size === "micro" ? "micro" : a.size;
  const pool = ACTIONS[action.behavior][size];
  const seated = barrier === "pain" || barrier === "heat";
  const title = (seated ? pool.seated : pool.title)[lang] || pool.title.en;
  const time = (SLOTS[(goal && goal.work_pattern) || "office"] || SLOTS.office)[a.timing];
  return { ...action, size, timing: a.timing, tone: a.tone, title, time, note: a.note[lang] || a.note.en, technique: "com_b" };
}

/* ---------- resilience with grace days ---------- */
const OUTCOME_VALUE = { done: 1, partial: 0.6, skipped: 0 };

/** Rolling 28-day consistency that forgives two zero days per week. */
export function resilientScore(logs, windowDays = 28, gracePerWeek = 2) {
  const today = isoDate();
  let sum = 0, counted = 0, graceUsed = 0, doneDays = 0;
  const zeros = [];
  const perDay = {};
  for (const l of logs.filter((x) => x.behavior !== "checkin")) {
    const v = OUTCOME_VALUE[l.outcome] ?? 0;
    if (perDay[l.date] === undefined || v > perDay[l.date]) perDay[l.date] = v;
  }
  for (let i = 0; i < windowDays; i++) {
    const day = addDays(today, -i);
    const v = perDay[day] ?? 0;
    if (v > 0) doneDays++;
    else zeros.push(day);
  }
  // Forgive the most recent zero days, bounded by the weekly grace allowance.
  const weeks = Math.ceil(windowDays / 7);
  const forgiven = new Set(zeros.slice(0, gracePerWeek * weeks));
  graceUsed = forgiven.size;
  for (let i = 0; i < windowDays; i++) {
    const day = addDays(today, -i);
    if (forgiven.has(day)) continue;
    counted++;
    sum += perDay[day] ?? 0;
  }
  return {
    score: counted ? Math.round((sum / counted) * 100) : 0,
    graceUsed,
    graceAllowance: gracePerWeek * weeks,
    doneDays,
    windowDays,
  };
}

/* ---------- lapse detection ---------- */
/**
 * Combines missed days, ignored nudges and a declining effort trend into a 0–1 risk.
 * Not a diagnosis — a hint that the next ask should be smaller.
 */
export function lapseRisk(logs) {
  const today = isoDate();
  const perDay = {};
  for (const l of logs.filter((x) => x.behavior !== "checkin")) {
    const v = OUTCOME_VALUE[l.outcome] ?? 0;
    if (perDay[l.date] === undefined) perDay[l.date] = { v, effort: l.effort ?? null, outcome: l.outcome };
    else if (v > perDay[l.date].v) perDay[l.date] = { v, effort: l.effort ?? null, outcome: l.outcome };
  }
  let missed = 0, ignored = 0;
  for (let i = 0; i < 7; i++) {
    const day = addDays(today, -i);
    const rec = perDay[day];
    if (!rec || rec.v === 0) missed++;
    if (rec && rec.outcome === "skipped") ignored++;
  }
  const recent = [];
  const earlier = [];
  for (let i = 0; i < 3; i++) {
    const r = perDay[addDays(today, -i)];
    if (r && r.effort != null) recent.push(r.effort);
  }
  for (let i = 3; i < 7; i++) {
    const r = perDay[addDays(today, -i)];
    if (r && r.effort != null) earlier.push(r.effort);
  }
  const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
  const rAvg = avg(recent), eAvg = avg(earlier);
  const effortDecline = rAvg != null && eAvg != null ? Math.max(0, Math.min(1, (rAvg - eAvg) / 4)) : 0;

  let sinceDone = 0;
  for (let i = 0; i < 14; i++) {
    const r = perDay[addDays(today, -i)];
    if (r && r.v > 0) break;
    sinceDone++;
  }

  const missRate = missed / 7;
  const ignoreRate = ignored / 7;
  const score = Math.max(0, Math.min(1,
    0.42 * missRate + 0.18 * ignoreRate + 0.22 * effortDecline + 0.18 * Math.min(1, sinceDone / 5)));

  const drivers = [];
  if (missRate >= 0.4) drivers.push("missed_days");
  if (ignoreRate >= 0.25) drivers.push("ignored");
  if (effortDecline >= 0.25) drivers.push("effort");
  if (sinceDone >= 3) drivers.push("gap");

  return {
    score: Number(score.toFixed(2)),
    band: score >= 0.62 ? "high" : score >= 0.36 ? "medium" : "low",
    drivers,
    missed,
    sinceDone,
  };
}

/** Average days from a lapse to the next logged action. */
export function recoveryStats(lapses) {
  const done = lapses.filter((l) => l.status === "recovered" && l.recovery_days != null);
  if (!done.length) return { avg: null, count: 0, within7: 0 };
  const avg = done.reduce((s, l) => s + l.recovery_days, 0) / done.length;
  return {
    avg: Number(avg.toFixed(1)),
    count: done.length,
    within7: done.filter((l) => l.recovery_days <= 7).length,
    within7Pct: Math.round((done.filter((l) => l.recovery_days <= 7).length / done.length) * 100),
  };
}

/** Posterior updates produced by one log (call once per log). */
export function banditUpdates(action, outcome) {
  const reward = outcome === "done" ? 1 : outcome === "partial" ? 0.5 : 0;
  return DIMENSIONS.map((dim) => ({
    dimension: dim,
    variant: action[dim],
    successDelta: reward,
    trialDelta: 1,
  }));
}

/** Week-by-week consistency, for the personal trend chart. */
export function weeklyTrend(logs, weeks = 8) {
  const out = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = addDays(isoDate(), -w * 7);
    let sum = 0, n = 0;
    for (let d = 0; d < 7; d++) {
      const day = addDays(end, -d);
      const rec = logs.filter((l) => l.date === day);
      const v = rec.length ? Math.max(...rec.map((l) => OUTCOME_VALUE[l.outcome] ?? 0)) : 0;
      sum += v; n++;
    }
    out.push({ week: `W${weeks - w}`, score: Math.round((sum / n) * 100) });
  }
  return out;
}