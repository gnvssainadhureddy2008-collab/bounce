import { useState } from "react";

/** A small inline mouth curve — no emoji in the interface. */
function MoodFace({ level }) {
  const controls = [11, 12, 15, 17.5, 19.5];
  const d = level === 3 ? "M8 15h8" : `M8 15c2 ${controls[level - 1] - 15} 6 ${controls[level - 1] - 15} 8 0`;
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9.2" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <path d={d} strokeLinecap="round" />
    </svg>
  );
}

/**
 * Optional daily check-in. Kept to two rows of five, because a long form is the
 * quickest way to lose someone on a hard day.
 */
export default function Checkin({ lang, t, initial, onSave }) {
  const ar = lang === "ar";
  const [mood, setMood] = useState(initial?.mood ?? null);
  const [energy, setEnergy] = useState(initial?.energy ?? null);
  const [saved, setSaved] = useState(false);

  const save = async (nextMood, nextEnergy) => {
    if (nextMood == null && nextEnergy == null) return;
    await onSave({ mood: nextMood, energy: nextEnergy });
    setSaved(true);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
      <p className="text-[13px] text-foreground">{t("today.checkin")}</p>
      <div className="mt-4 space-y-3">
        {[
          { key: "mood", label: t("today.mood"), value: mood, set: setMood },
          { key: "energy", label: t("today.energy"), value: energy, set: setEnergy },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="w-16 text-[12px] text-muted-foreground">{row.label}</span>
            <div className="flex gap-1.5" role="group" aria-label={row.label}>
              {[1, 2, 3, 4, 5].map((level) => {
                const on = row.value === level;
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${row.label} ${level}`}
                    onClick={() => { row.set(level); setSaved(false); }}
                    className={`grid h-8 w-8 place-items-center rounded-full border transition-colors ${
                      on ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground hover:border-sand/40"
                    }`}
                  >
                    <MoodFace level={level} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => save(mood, energy)}
        className="mt-4 w-full rounded-xl border border-border py-2 text-[12px] text-foreground transition-colors hover:border-aqua/50"
      >
        {saved ? t("common.saved") : t("common.save")}
      </button>
      <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground/70">
        {ar
          ? "اختياري تمامًا. يُستخدم فقط لتصغير الطلب في الأيام الصعبة — ويُحذف مع حسابك."
          : "Entirely optional. Used only to make the ask smaller on hard days — and deleted with your account."}
      </p>
    </div>
  );
}