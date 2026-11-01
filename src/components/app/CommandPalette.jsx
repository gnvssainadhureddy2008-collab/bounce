import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePrefs } from "@/lib/PrefsContext";

const ITEMS = [
  { to: "/today", key: "nav.today" },
  { to: "/plan", key: "nav.plan" },
  { to: "/insights", key: "nav.insights" },
  { to: "/modules", key: "nav.modules" },
  { to: "/recovery", key: "nav.recovery" },
  { to: "/impact", key: "nav.impact" },
  { to: "/settings", key: "nav.settings" },
  { to: "/", key: "nav.landing" },
];

/** Global command palette — Cmd/Ctrl+K from anywhere in the app. */
export default function CommandPalette({ open, onOpenChange }) {
  const { t, lang, theme, calm, setLang, setTheme, toggleCalm } = usePrefs();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => { if (open) setQuery(""); }, [open]);

  const actions = useMemo(
    () => [
      { id: "theme", label: `${t("common.theme")}: ${theme === "dark" ? t("common.light") : t("common.dark")}`, run: () => setTheme(theme === "dark" ? "light" : "dark") },
      { id: "lang", label: `${t("common.language")}: ${lang === "ar" ? "English" : "العربية"}`, run: () => setLang(lang === "ar" ? "en" : "ar") },
      { id: "calm", label: `${t("common.calm")}: ${calm ? t("common.off") : t("common.on")}`, run: toggleCalm },
    ],
    [t, theme, lang, calm, setTheme, setLang, toggleCalm],
  );

  const q = query.trim().toLowerCase();
  const pages = ITEMS.filter((i) => t(i.key).toLowerCase().includes(q));
  const cmds = actions.filter((a) => a.label.toLowerCase().includes(q));

  const go = (to) => { onOpenChange(false); navigate({ to }); };
  const run = (fn) => { onOpenChange(false); fn(); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{t("palette.hint")}</DialogTitle>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("palette.hint")}
          aria-label={t("palette.hint")}
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="max-h-72 overflow-y-auto p-2">
          {pages.length > 0 && (
            <p className="px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {lang === "ar" ? "الشاشات" : "Screens"}
            </p>
          )}
          {pages.map((p) => (
            <button
              key={p.to}
              type="button"
              onClick={() => go(p.to)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-[13px] text-foreground hover:bg-secondary"
            >
              {t(p.key)}
              <span className="text-[10px] text-muted-foreground">{p.to}</span>
            </button>
          ))}
          {cmds.length > 0 && (
            <p className="px-2 pb-1.5 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {lang === "ar" ? "إجراءات" : "Actions"}
            </p>
          )}
          {cmds.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => run(c.run)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-start text-[13px] text-foreground hover:bg-secondary"
            >
              {c.label}
            </button>
          ))}
          {pages.length === 0 && cmds.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">{t("common.none")}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}