import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, CalendarDays, HeartHandshake, Layers, LineChart, Settings, Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import Wordmark from "@/components/brand/Wordmark";
import ProfileMenu from "@/components/app/ProfileMenu";
import CommandPalette from "@/components/app/CommandPalette";
import { usePrefs } from "@/lib/PrefsContext";


const NAV = [
  { to: "/today", key: "nav.today", Icon: Sparkles },
  { to: "/plan", key: "nav.plan", Icon: CalendarDays },
  { to: "/insights", key: "nav.insights", Icon: LineChart },
  { to: "/modules", key: "nav.modules", Icon: Layers },
  { to: "/recovery", key: "nav.recovery", Icon: HeartHandshake },
  { to: "/impact", key: "nav.impact", Icon: BarChart3 },
  { to: "/settings", key: "nav.settings", Icon: Settings },
];

const MOBILE = ["/today", "/plan", "/insights", "/modules", "/settings"];

export default function AppShell({ children }) {
  const { t, lang } = usePrefs();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [guest, setGuestState] = useState(false);

  useEffect(() => {
    setGuestState(typeof window !== "undefined" && window.localStorage.getItem("bounce.guest") === "1");
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mobileNav = NAV.filter((n) => MOBILE.includes(n.to));

  return (
    <div className="relative min-h-[100svh] bg-background">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(70%_50%_at_85%_-10%,hsl(var(--aqua)/0.12),transparent_65%)]" />

      {/* desktop rail */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[248px] flex-col border-e border-border/60 bg-card/40 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link to="/" className="px-2 py-1" aria-label={t("nav.landing")}>
          <Wordmark />
        </Link>
        <nav className="mt-9 flex flex-1 flex-col gap-1" aria-label={t("brand.name")}>
          {NAV.map(({ to, key, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors ${
                  active ? "bg-aqua/10 text-sand" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon className={`h-[17px] w-[17px] ${active ? "text-aqua" : "text-muted-foreground group-hover:text-foreground"}`} strokeWidth={1.6} />
                {t(key)}
                {active && <span className="ms-auto h-1 w-1 rounded-full bg-aqua" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-border/60 pt-4">
          <ProfileMenu />
        </div>
      </aside>

      {/* mobile bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/" aria-label={t("nav.landing")}>
          <Wordmark size="text-base" />
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
            aria-label={t("palette.hint")}
          >
            ⌘K
          </button>
          <ProfileMenu compact />
        </div>
      </header>

      {guest && (
        <div className="relative z-20 mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pt-4 text-[12px] text-muted-foreground sm:px-8">
          <p>{t("settings.demo")}</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/login", search: { returnTo: "/today" } })}
            className="rounded-full border border-aqua/40 px-3 py-1 text-aqua transition-colors hover:bg-aqua/10"
          >
            {lang === "ar" ? "احفظ خطتي بحساب" : "Save my plan to an account"}
          </button>
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-8 lg:ms-[248px] lg:max-w-none lg:pb-16 lg:pt-10">
        <div className="mx-auto w-full max-w-[900px]">{children}</div>
      </main>

      {/* mobile tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label={t("brand.name")}>
        <ul className="flex items-stretch justify-between px-2">
          {mobileNav.map(({ to, key, Icon }) => {
            const active = pathname === to;
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-aqua" : "text-muted-foreground"}`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}