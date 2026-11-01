import { useNavigate } from "@tanstack/react-router";
import { Globe, LogOut, Moon, Sun, Waves } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { usePrefs } from "@/lib/PrefsContext";

export default function ProfileMenu({ compact = false }) {
  const { user, logout } = useAuth();
  const { t, lang, theme, calm, setLang, setTheme, toggleCalm } = usePrefs();
  const navigate = useNavigate();

  const name = user?.full_name || (lang === "ar" ? "زائر" : "Guest");
  const email = user?.email || (lang === "ar" ? "البيانات على هذا الجهاز" : "Data saved on this device");
  const initials = (user?.full_name || "B").slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex w-full items-center gap-3 rounded-xl p-1.5 text-start transition-colors hover:bg-secondary/60 ${compact ? "w-auto" : ""}`}
          aria-label={lang === "ar" ? "قائمة الحساب" : "Account menu"}
        >
          <Avatar className="h-8 w-8 border border-border">
            {user?.data?.image_url ? <AvatarImage src={user.data.image_url} alt="" /> : null}
            <AvatarFallback className="bg-aqua/15 text-[11px] text-aqua">{initials}</AvatarFallback>
          </Avatar>
          {!compact && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-foreground">{name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{email}</span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-[13px] text-foreground">{name}</p>
          <p className="text-[11px] font-normal text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setLang(lang === "ar" ? "en" : "ar"); }}>
          <Globe className="me-2 h-4 w-4" />
          {lang === "ar" ? "English" : "العربية"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTheme(theme === "dark" ? "light" : "dark"); }}>
          {theme === "dark" ? <Sun className="me-2 h-4 w-4" /> : <Moon className="me-2 h-4 w-4" />}
          {theme === "dark" ? t("common.light") : t("common.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleCalm(); }}>
          <Waves className="me-2 h-4 w-4" />
          {t("common.calm")} · {calm ? t("common.on") : t("common.off")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onSelect={() => logout()}>
            <LogOut className="me-2 h-4 w-4" />
            {t("common.signout")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => navigate({ to: "/login", search: { returnTo: "/today" } })}>
            <LogOut className="me-2 h-4 w-4" />
            {t("common.signin")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}