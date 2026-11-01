import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/app/States";
import { recoveryStats, resilientScore } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";

/** The signed-in person's own line inside the programme dashboard. */
export default function AccountSummary() {
  const acc = useAccount();
  const { t, lang } = usePrefs();
  const ar = lang === "ar";

  if (acc.loading) return <Card className="mt-4"><div className="h-20 animate-pulse rounded-xl bg-secondary/60" /></Card>;

  const score = resilientScore(acc.logs);
  const rec = recoveryStats(acc.lapses);

  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{ar ? "بياناتك ضمن اللوحة" : "Your own data, alongside the cohort"}</p>
        <Link to="/today" className="flex items-center gap-1 text-[11.5px] text-aqua">
          {t("nav.today")} <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          { label: t("today.score"), value: `${score.score}/100` },
          { label: t("insights.recovery"), value: rec.avg != null ? `${rec.avg} ${t("common.days")}` : "—" },
          { label: ar ? "خطوات مسجّلة" : "Steps logged", value: acc.logs.filter((l) => l.behavior !== "checkin").length },
          { label: ar ? "أوسمة" : "Badges", value: acc.badges.length },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-background/40 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 font-heading text-lg text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}