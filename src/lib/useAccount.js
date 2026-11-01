import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { flushQueue, isGuest, loadAccount, migrateGuestData } from "@/lib/store";
import { usePrefs } from "@/lib/PrefsContext";

/**
 * One load of the person's account, shared by every app screen.
 * Also replays any writes queued while offline, and mirrors the account's
 * language / theme / calm-mode choices onto the device.
 */
export function useAccount() {
  const { user } = useAuth();
  const { applyAccountSettings } = usePrefs();
  const [state, setState] = useState({
    loading: true,
    error: null,
    settings: null,
    goals: [],
    actions: [],
    logs: [],
    stats: [],
    lapses: [],
    badges: [],
  });
  const [guest, setGuestState] = useState(false);
  const [offline, setOffline] = useState(false);

  const reload = useCallback(async () => {
    try {
      const account = await loadAccount();
      setState({ loading: false, error: null, ...account });
      if (account.settings) applyAccountSettings(account.settings);
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, [applyAccountSettings]);

  // A guest who has just signed in keeps their work: it moves into the account once.
  useEffect(() => {
    if (!user?.id) return;
    if (!isGuest()) return;
    migrateGuestData()
      .then((result) => { if (result?.migrated) { setGuestState(false); reload(); } })
      .catch(() => { /* migration is best-effort; the guest copy stays in this browser */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    setGuestState(isGuest());
    reload();
    if (isGuest()) return undefined;
    let cancelled = false;
    flushQueue().then((n) => { if (n && !cancelled) reload(); });
    const onOnline = () => {
      setOffline(false);
      flushQueue().then(() => { if (!cancelled) reload(); });
    };
    const onOffline = () => setOffline(true);
    setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [reload, user?.id]);

  return { ...state, reload, guest, offline, user };
}