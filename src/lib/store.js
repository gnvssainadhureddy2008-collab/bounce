/**
 * Bounce — one storage layer for both account mode and guest mode.
 *
 *  · Signed in: records live in the app's database under the person's account, so a
 *    plan built on a phone is on the laptop too. Row-level security keeps every row
 *    owner-only.
 *  · Guest: the same shapes are kept in localStorage, so the whole product can be
 *    judged without an account. On sign-in the guest's data is migrated.
 *  · Offline: writes that fail are queued and replayed when the network returns.
 */

import { base44 } from "@/api/base44Client";

const GUEST_KEY = "bounce.guest";
const DATA_KEY = "bounce.guest.data";
const QUEUE_KEY = "bounce.queue";

export const ENTITIES = {
  settings: "UserSettings",
  goals: "Goal",
  actions: "PlanAction",
  logs: "ActionLog",
  stats: "BanditStat",
  lapses: "Lapse",
  badges: "Badge",
};

/* ---------------- guest mode ---------------- */
export const isGuest = () => {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(GUEST_KEY) === "1"; } catch { return false; }
};
export const setGuest = (on) => {
  try {
    if (on) window.localStorage.setItem(GUEST_KEY, "1");
    else window.localStorage.removeItem(GUEST_KEY);
  } catch { /* storage blocked — stay in account mode */ }
};

function readGuestData() {
  try {
    return JSON.parse(window.localStorage.getItem(DATA_KEY) || "{}");
  } catch { return {}; }
}
function writeGuestData(data) {
  try { window.localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* full or blocked */ }
}
const guestRows = (kind) => readGuestData()[kind] || [];
function setGuestRows(kind, rows) {
  const data = readGuestData();
  data[kind] = rows;
  writeGuestData(data);
}
const uid = () => `g_${Math.random().toString(36).slice(2, 10)}`;

/* ---------------- offline queue ---------------- */
function enqueue(op) {
  try {
    const q = JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "[]");
    q.push(op);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch { /* nothing else we can do */ }
}

/** Replay queued writes. Called on reconnect and after load. */
export async function flushQueue() {
  if (typeof window === "undefined" || isGuest()) return 0;
  let q = [];
  try { q = JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return 0; }
  if (!q.length) return 0;
  const remaining = [];
  for (const op of q) {
    try {
      if (op.type === "create") await base44.entities[op.entity].create(op.data);
      else if (op.type === "update") await base44.entities[op.entity].update(op.id, op.data);
      else if (op.type === "delete") await base44.entities[op.entity].delete(op.id);
    } catch {
      remaining.push(op);
    }
  }
  try { window.localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); } catch { /* ignore */ }
  return q.length - remaining.length;
}

/* ---------------- generic access ---------------- */
export async function listAll(kind) {
  if (isGuest()) return guestRows(kind);
  const page = await base44.entities[ENTITIES[kind]].filter({}, { sort: "-created_date", limit: 500 });
  return page?.items ?? [];
}

export async function createOne(kind, data) {
  if (isGuest()) {
    const row = { ...data, id: uid(), created_date: new Date().toISOString() };
    setGuestRows(kind, [row, ...guestRows(kind)]);
    return row;
  }
  try {
    return await base44.entities[ENTITIES[kind]].create(data);
  } catch (error) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      enqueue({ type: "create", entity: ENTITIES[kind], data });
    }
    throw error;
  }
}

export async function createMany(kind, rows) {
  if (!rows.length) return [];
  if (isGuest()) {
    const made = rows.map((r) => ({ ...r, id: uid(), created_date: new Date().toISOString() }));
    setGuestRows(kind, [...made, ...guestRows(kind)]);
    return made;
  }
  return base44.entities[ENTITIES[kind]].bulkCreate(rows);
}

export async function updateOne(kind, id, data) {
  if (isGuest()) {
    const rows = guestRows(kind).map((r) => (r.id === id ? { ...r, ...data } : r));
    setGuestRows(kind, rows);
    return rows.find((r) => r.id === id);
  }
  try {
    return await base44.entities[ENTITIES[kind]].update(id, data);
  } catch (error) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      enqueue({ type: "update", entity: ENTITIES[kind], id, data });
    }
    throw error;
  }
}

export async function deleteOne(kind, id) {
  if (isGuest()) {
    setGuestRows(kind, guestRows(kind).filter((r) => r.id !== id));
    return true;
  }
  return base44.entities[ENTITIES[kind]].delete(id);
}

/* ---------------- settings singleton ---------------- */
export const DEFAULT_SETTINGS = {
  language: "en",
  theme: "dark",
  calm_mode: false,
  simple_language: false,
  large_text: false,
  screen_reader: false,
  channel: "app",
  quiet_start: "22:00",
  quiet_end: "07:00",
  notifications: false,
  consents: {},
  onboarded: false,
  display_name: "",
  vacation_mode: false,
  tour_done: false,
};

export async function loadSettings() {
  const rows = await listAll("settings");
  if (rows.length) return { ...DEFAULT_SETTINGS, ...rows[0] };
  return null;
}

export async function saveSettings(patch, existing) {
  if (existing?.id) return updateOne("settings", existing.id, patch);
  return createOne("settings", { ...DEFAULT_SETTINGS, ...patch });
}

/** The whole account, as one object — used by Insights, Impact and the JSON export. */
export async function loadAccount() {
  const [settings, goals, actions, logs, stats, lapses, badges] = await Promise.all([
    loadSettings(),
    listAll("goals"),
    listAll("actions"),
    listAll("logs"),
    listAll("stats"),
    listAll("lapses"),
    listAll("badges"),
  ]);
  return { settings, goals, actions, logs, stats, lapses, badges };
}

/** Guest → account migration, run once right after a guest signs in. */
export async function migrateGuestData() {
  if (!isGuest()) return { migrated: false };
  const data = readGuestData();
  if (!Object.keys(data).length) { setGuest(false); return { migrated: false }; }
  const created = [];
  for (const kind of ["goals", "actions", "logs", "stats", "lapses", "badges", "settings"]) {
    const rows = data[kind] || [];
    if (!rows.length) continue;
    for (const row of rows) {
      const { id, created_by_id, created_date, updated_date, ...rest } = row;
      try {
        const made = await base44.entities[ENTITIES[kind]].create(rest);
        created.push(made.id);
      } catch { /* a single row failing must not stop the migration */ }
    }
  }
  try { window.localStorage.removeItem(DATA_KEY); } catch { /* ignore */ }
  setGuest(false);
  return { migrated: true, count: created.length };
}