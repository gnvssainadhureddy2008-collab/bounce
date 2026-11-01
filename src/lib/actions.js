/**
 * Writing an outcome — the single place where the product learns.
 * One tap updates: the action's status, the log, the bandit posteriors, the
 * lapse record, and any badge the person has earned.
 */

import { banditUpdates, daysBetween, isoDate } from "@/lib/engine";
import { createOne, updateOne } from "@/lib/store";

/** Beta posteriors for the four dimensions this action used. */
export async function applyBandit(stats, action, outcome) {
  const reward = outcome === "done" ? 1 : outcome === "partial" ? 0.5 : 0;
  const updates = banditUpdates(action, outcome).filter((u) => u.variant);
  await Promise.all(
    updates.map(async (u) => {
      const row = stats.find((r) => r.dimension === u.dimension && r.variant === u.variant);
      if (row) {
        await updateOne("stats", row.id, {
          successes: (row.successes || 0) + u.successDelta,
          trials: (row.trials || 0) + u.trialDelta,
          last_updated: isoDate(),
        });
      } else {
        await createOne("stats", {
          dimension: u.dimension,
          variant: u.variant,
          successes: u.successDelta,
          trials: u.trialDelta,
          last_updated: isoDate(),
        });
      }
    }),
  );
}

/** Close an open lapse as recovered, and award the recovery badge once. */
export async function closeLapse({ lapses, badges, action }) {
  const open = lapses.find((l) => l.status === "open");
  if (!open) return { recovered: false };
  const days = Math.max(0, daysBetween(open.start_date, action.date || isoDate()));
  await updateOne("lapses", open.id, {
    status: "recovered",
    end_date: action.date || isoDate(),
    recovery_days: days,
  });
  const has = badges.some((b) => b.key === "recovery");
  if (!has) {
    await createOne("badges", {
      key: "recovery",
      label: "Came back after a lapse",
      earned_date: isoDate(),
    });
  }
  return { recovered: true, days };
}

/** The main write path behind Done / Smaller / Not today. */
export async function logOutcome({ action, outcome, effort, barrier, note, mood, energy, stats, lapses, badges, source = "live" }) {
  const today = isoDate();
  await updateOne("actions", action.id, {
    status: outcome === "done" ? "done" : outcome === "partial" ? "partial" : "skipped",
    effort: effort ?? null,
  });
  await createOne("logs", {
    action_id: action.id,
    date: action.date || today,
    behavior: action.behavior,
    outcome,
    effort: effort ?? null,
    barrier: barrier || null,
    size: action.size,
    timing: action.timing,
    tone: action.tone,
    channel: action.channel,
    mood: mood ?? null,
    energy: energy ?? null,
    note: note || null,
    source,
  });
  await applyBandit(stats, action, outcome);
  const recovery = outcome === "done" ? await closeLapse({ lapses, badges, action }) : { recovered: false };
  return recovery;
}