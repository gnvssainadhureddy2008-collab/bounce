import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dirFor, translate } from "@/lib/i18n";

/**
 * Language, theme, calm mode, simple language and large text — device-level
 * preferences (kept in localStorage) that a signed-in person also saves to their
 * account, so the same choices follow them to another device.
 */

const KEY = "bounce.prefs";
const DEFAULTS = { lang: "en", theme: "dark", calm: false, simple: false, largeText: false, langPicked: false };

const PrefsContext = createContext(null);

/**
 * First visit, nothing chosen yet: follow the device's own language, so a phone or
 * browser set to Arabic opens the site in Arabic and right-to-left straight away.
 */
function deviceLanguage() {
  if (typeof navigator === "undefined") return "en";
  const list = navigator.languages?.length ? navigator.languages : [navigator.language || ""];
  return list.some((l) => String(l).toLowerCase().startsWith("ar")) ? "ar" : "en";
}

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  // Nothing is applied or saved until the device's own choices have been read,
  // otherwise the first frame would stomp the Arabic direction back to English.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(KEY) || "null");
      if (saved) setPrefs((p) => ({ ...p, ...saved }));
      else setPrefs((p) => ({ ...p, lang: deviceLanguage() }));
    } catch { /* first visit */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.lang = prefs.lang;
    root.dir = dirFor(prefs.lang);
    root.classList.toggle("light", prefs.theme === "light");
    root.classList.toggle("dark", prefs.theme === "dark");
    root.classList.toggle("calm", !!prefs.calm);
    if (document.body) document.body.dataset.largeText = String(!!prefs.largeText);
    try { window.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs, ready]);

  const update = useCallback((patch) => setPrefs((p) => ({ ...p, ...patch })), []);

  /**
   * Pull account-level preferences in once the person's settings load.
   * The language is the exception: an account row carries a stored value from the
   * moment it is created, so letting it win would snap the whole app back to that
   * language (mirroring the layout with it) right after the person chose another
   * one on this device. A language picked here always wins; the account value is
   * only used on a device where nothing has been chosen yet.
   */
  const applyAccountSettings = useCallback((s) => {
    if (!s) return;
    setPrefs((p) => ({
      ...p,
      lang: p.langPicked ? p.lang : s.language || p.lang,
      theme: s.theme || p.theme,
      calm: !!s.calm_mode,
      simple: !!s.simple_language,
      largeText: !!s.large_text,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...prefs,
      dir: dirFor(prefs.lang),
      setLang: (lang) => update({ lang, langPicked: true }),
      setTheme: (theme) => update({ theme }),
      toggleCalm: () => update({ calm: !prefs.calm }),
      setSimple: (simple) => update({ simple }),
      setLargeText: (largeText) => update({ largeText }),
      t: (key, vars) => translate(prefs.lang, key, vars),
      applyAccountSettings,
    }),
    [prefs, update, applyAccountSettings],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PrefsProvider");
  return ctx;
}