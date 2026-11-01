import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Download, Globe, Languages, LogOut, Moon, ShieldCheck, Sun, Trash2, Waves } from "lucide-react";
import { Card, PageHeader, PageSkeleton } from "@/components/app/States";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";
import { deleteOne, saveSettings } from "@/lib/store";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "My data — Bounce" }] }),
  component: SettingsPage,
});

const CONSENTS = [
  { id: "steps", en: "Movement and step data", ar: "بيانات الحركة والخطوات" },
  { id: "checkins", en: "Mood and energy check-ins", ar: "تحية المزاج والطاقة" },
  { id: "reminders", en: "Reminders in my chosen channel", ar: "تذكيرات في قناتي المختارة" },
];

function Row({ icon: Icon, label, hint, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 py-3 last:border-0">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" strokeWidth={1.6} />}
        <div>
          <p className="text-[12.5px] text-foreground">{label}</p>
          {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Toggle({ on, onClick, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${on ? "bg-aqua/80" : "bg-secondary"}`}
    >
      <span className={`h-5 w-5 rounded-full bg-background transition-transform ${on ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
    </button>
  );
}

function SettingsPage() {
  const acc = useAccount();
  const { t, lang, theme, calm, simple, largeText, setLang, setTheme, toggleCalm, setSimple, setLargeText } = usePrefs();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const ar = lang === "ar";
  const [name, setName] = useState(acc.settings?.display_name || "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (acc.loading) return <PageSkeleton />;
  const s = acc.settings || {};

  const save = async (patch) => {
    try {
      await saveSettings(patch, acc.settings);
      await acc.reload();
      toast.success(t("common.saved"));
    } catch (error) {
      toast.error(error.message || String(error));
    }
  };

  const toggleConsent = (id) => {
    const consents = { ...(s.consents || {}), [id]: !(s.consents || {})[id], recorded_at: new Date().toISOString() };
    save({ consents });
  };

  const enableNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error(ar ? "المتصفح لا يدعم الإشعارات." : "This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await save({ notifications: true });
      toast.success(ar ? "الإشعارات مفعّلة." : "Notifications enabled.");
    } else {
      toast.error(ar ? "لم يُمنح الإذن." : "Permission was not granted.");
    }
  };

  const exportData = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      profile: { name: acc.user?.full_name || s.display_name, email: acc.user?.email || null },
      settings: acc.settings,
      goals: acc.goals,
      plans: acc.actions,
      actionLogs: acc.logs,
      banditStats: acc.stats,
      lapses: acc.lapses,
      badges: acc.badges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bounce-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("toast.exported"));
  };

  const deleteEverything = async () => {
    setBusy(true);
    try {
      const kinds = [
        ["goals", acc.goals], ["actions", acc.actions], ["logs", acc.logs],
        ["stats", acc.stats], ["lapses", acc.lapses], ["badges", acc.badges],
      ];
      for (const [kind, rows] of kinds) {
        await Promise.all(rows.map((row) => deleteOne(kind, row.id)));
      }
      if (acc.settings?.id) await deleteOne("settings", acc.settings.id);
      try {
        ["bounce.guest", "bounce.guest.data", "bounce.queue", "bounce.prefs"].forEach((k) => window.localStorage.removeItem(k));
      } catch { /* ignore */ }
      setConfirmOpen(false);
      if (acc.user) logout();
      else navigate({ to: "/" });
    } catch (error) {
      toast.error(error.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={t("settings.title")} subtitle={ar ? "كل شيء يمكن تغييره، وكل شيء يمكن حذفه." : "Everything is changeable, and everything is deletable."} />

      <div className="space-y-4">
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("settings.profile")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] text-muted-foreground">
              {ar ? "الاسم" : "Name"}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => save({ display_name: name })}
                className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-[12.5px] text-foreground"
              />
            </label>
            <label className="text-[11px] text-muted-foreground">
              {ar ? "البريد" : "Email"}
              <input value={acc.user?.email || (ar ? "وضع الزائر" : "Guest mode")} readOnly className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-[12.5px] text-muted-foreground" />
            </label>
          </div>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("settings.experience")}</p>
          <Row icon={Languages} label={t("common.language")}>
            {[["en", "English"], ["ar", "العربية"]].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => { setLang(id); save({ language: id }); }}
                aria-pressed={lang === id}
                className={`rounded-full border px-3 py-1.5 text-[11.5px] ${lang === id ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </Row>
          <Row icon={theme === "dark" ? Moon : Sun} label={t("common.theme")}>
            {["dark", "light"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => { setTheme(id); save({ theme: id }); }}
                aria-pressed={theme === id}
                className={`rounded-full border px-3 py-1.5 text-[11.5px] ${theme === id ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground"}`}
              >
                {t(id === "dark" ? "common.dark" : "common.light")}
              </button>
            ))}
          </Row>
          <Row icon={Waves} label={t("common.calm")} hint={ar ? "يوقف الحركات والتدرجات." : "Stops motion and transitions."}>
            <Toggle on={calm} onClick={() => { toggleCalm(); save({ calm_mode: !calm }); }} label={t("common.calm")} />
          </Row>
          <Row icon={Globe} label={ar ? "لغة بسيطة" : "Simple language"} hint={ar ? "جمل أقصر وشرح أقل." : "Shorter sentences, fewer concepts."}>
            <Toggle on={simple} onClick={() => { setSimple(!simple); save({ simple_language: !simple }); }} label="simple" />
          </Row>
          <Row icon={Globe} label={t("onboard.large")}>
            <Toggle on={largeText} onClick={() => { setLargeText(!largeText); save({ large_text: !largeText }); }} label="large text" />
          </Row>
          <Row icon={Globe} label={t("onboard.mobility")}>
            <Toggle on={!!s.mobility} onClick={() => save({ mobility: !s.mobility })} label="mobility" />
          </Row>
          <Row icon={Globe} label={ar ? "مراعاة الصيام" : "Fasting-aware timing"}>
            <Toggle on={!!s.fasting_aware} onClick={() => save({ fasting_aware: !s.fasting_aware })} label="fasting" />
          </Row>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{ar ? "التذكيرات" : "Reminders"}</p>
          <Row icon={Bell} label={ar ? "إشعارات المتصفح" : "Browser notifications"} hint={`${t("onboard.quiet")}: ${s.quiet_start || "22:00"}–${s.quiet_end || "07:00"}`}>
            {s.notifications ? (
              <span className="text-[11px] text-aqua">{t("common.on")}</span>
            ) : (
              <button type="button" onClick={enableNotifications} className="rounded-full border border-aqua/40 px-3 py-1.5 text-[11.5px] text-aqua">
                {ar ? "تفعيل" : "Enable"}
              </button>
            )}
          </Row>
          <Row icon={Waves} label={ar ? "إيقاف الخطة مؤقتًا (سفر)" : "Pause plan (vacation mode)"} hint={ar ? "لا تذكيرات، والتقدّم محفوظ." : "No nudges, progress kept."}>
            <Toggle on={!!s.vacation_mode} onClick={() => save({ vacation_mode: !s.vacation_mode })} label="vacation" />
          </Row>
          <Row icon={Bell} label={ar ? "القناة" : "Channel"}>
            <select
              value={s.channel || "app"}
              onChange={(e) => save({ channel: e.target.value })}
              className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-[11.5px] text-foreground"
            >
              {["app", "whatsapp", "sms", "coach"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Row>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-[11px] text-muted-foreground">
              {t("onboard.quiet")} — {ar ? "من" : "from"}
              <input type="time" defaultValue={s.quiet_start || "22:00"} onBlur={(e) => save({ quiet_start: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-[12px]" />
            </label>
            <label className="text-[11px] text-muted-foreground">
              {t("onboard.quiet")} — {ar ? "إلى" : "to"}
              <input type="time" defaultValue={s.quiet_end || "07:00"} onBlur={(e) => save({ quiet_end: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-[12px]" />
            </label>
          </div>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("settings.consents")}</p>
          {CONSENTS.map((c) => {
            const on = !!(s.consents || {})[c.id];
            return (
              <Row key={c.id} icon={ShieldCheck} label={ar ? c.ar : c.en} hint={on && s.consents?.recorded_at ? `${ar ? "مسجّل" : "Recorded"}: ${String(s.consents.recorded_at).slice(0, 10)}` : undefined}>
                <Toggle on={on} onClick={() => toggleConsent(c.id)} label={c.id} />
              </Row>
            );
          })}
          <p className="mt-3 rounded-xl border border-border/60 bg-secondary/25 p-3 text-[11px] leading-relaxed text-muted-foreground">{t("settings.guardrail")}</p>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("settings.title")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={exportData} className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[12px] text-foreground hover:border-aqua/50">
              <Download className="h-3.5 w-3.5" /> {t("settings.export")}
            </button>
            <button type="button" onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2.5 text-[12px] text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" /> {t("settings.delete")}
            </button>
            {acc.user && (
              <button type="button" onClick={() => logout()} className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[12px] text-muted-foreground">
                <LogOut className="h-3.5 w-3.5" /> {t("common.signout")}
              </button>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-heading text-lg text-foreground">{t("settings.delete")}</DialogTitle>
          <DialogDescription className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {t("settings.deleteWarn")}
            <br />
            <br />
            {ar
              ? "تُحذف خطتك وسجلاتك وإحصاءاتك وأوسمتك من قاعدة البيانات نهائيًا. ويبقى حساب الدخول نفسه — لحذفه، تواصل مع الدعم."
              : "Your plan, logs, statistics and badges are permanently removed from the database. The sign-in identity itself remains — to remove that too, contact support."}
          </DialogDescription>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 rounded-xl border border-border py-2.5 text-[12px] text-muted-foreground">
              {t("common.cancel")}
            </button>
            <button type="button" disabled={busy} onClick={deleteEverything} className="flex-1 rounded-xl bg-destructive py-2.5 text-[12px] font-medium text-destructive-foreground disabled:opacity-60">
              {busy ? t("common.saving") : t("common.delete")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}