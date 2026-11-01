import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowLeft, Download, ShieldAlert } from "lucide-react";
import { Card, PageHeader } from "@/components/app/States";
import AccountSummary from "@/components/app/AccountSummary";
import { AGES, ACCESS, REGIONS, WORKS, applyFilters, buildCohort, equityView, summarise, toCsv } from "@/lib/cohort";
import { useAuth } from "@/lib/AuthContext";
import { usePrefs } from "@/lib/PrefsContext";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact dashboard — Bounce" },
      { name: "description", content: "Programme-level view of sustained behaviour change, recovery speed and equity across subgroups. Demonstration data." },
    ],
  }),
  component: ImpactPage,
});

const LABELS = {
  en: { all: "All", lang: "Language", age: "Age band", work: "Work pattern", access: "Accessibility", region: "Region", personal: "Your own data", cohort: "Cohort" },
  ar: { all: "الكل", lang: "اللغة", age: "الفئة العمرية", work: "نمط العمل", access: "الوصول", region: "المنطقة", personal: "بياناتك", cohort: "المجموعة" },
};

function ImpactPage() {
  const { t, lang } = usePrefs();
  const ar = lang === "ar";
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({ lang: "all", age: "all", work: "all", access: "all", region: "all" });
  useEffect(() => setMounted(true), []);

  const cohort = buildCohort(2000);
  const filtered = applyFilters(cohort, filters);
  const s = summarise(filtered);
  const equity = equityView(filtered);

  const exportCsv = () => {
    const csv = toCsv(filtered, filters);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bounce-impact.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const select = (key, values, labels) => (
    <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      {labels}
      <select
        value={filters[key]}
        onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
        className="rounded-lg border border-border bg-background/70 px-2.5 py-2 text-[12px] normal-case tracking-normal text-foreground outline-none"
      >
        <option value="all">{ar ? "الكل" : "All"}</option>
        {values.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </label>
  );

  const worst = equity.filter((e) => e.lagging).sort((a, b) => a.lagging.retention - b.lagging.retention)[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-2 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {ar ? "باونس" : "Bounce"}
        </Link>
        <span className="rounded-full border border-amber/30 px-2.5 py-1 text-[9.5px] uppercase tracking-[0.18em] text-amber/80">
          {t("impact.synthetic")}
        </span>
      </div>

      <PageHeader
        title={t("impact.title")}
        subtitle={t("impact.subtitle")}
        action={
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11.5px] text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            {t("impact.csv")}
          </button>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-5">
          {select("lang", ["en", "ar"], LABELS[lang].lang)}
          {select("age", AGES, LABELS[lang].age)}
          {select("work", WORKS, LABELS[lang].work)}
          {select("access", ACCESS, LABELS[lang].access)}
          {select("region", REGIONS, LABELS[lang].region)}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {s.count} {ar ? "شخصًا في هذا الترشيح" : "people in this view"} · {ar ? "المجموعة الكاملة ٢٠٠٠" : "full cohort 2,000"}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("impact.persistence")}</p>
          <div dir="ltr" className="mt-4 h-[240px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.persistence} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--aqua))" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="hsl(var(--aqua))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="persistence" stroke="hsl(var(--aqua))" strokeWidth={2.2} fill="url(#impactFill)" animationDuration={1400} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground/70">
            {ar ? "النسبة المئوية التي ما زالت على الخطة في كل أسبوع." : "Share still on plan at each week."}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("impact.recovery")}</p>
            <p className="mt-2 display text-4xl text-foreground">{s.recovered7}%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {ar ? "من كل من تعثّر عاد خلال أسبوع" : "of everyone who lapsed returned within a week"}
            </p>
          </Card>
          <Card>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("impact.behavior")}</p>
            <p className="mt-2 display text-4xl text-foreground">{s.behavior > 0 ? "+" : ""}{s.behavior}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{ar ? "نقطة، متوسط المجموعة" : "points, cohort mean"}</p>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("impact.retention")}</p>
          <div dir="ltr" className="mt-4 h-[200px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.retention} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="retention" radius={[4, 4, 0, 0]} fill="hsl(var(--aqua))" fillOpacity={0.65} animationDuration={1200}>
                    {s.retention.map((entry, i) => (
                      <Cell key={entry.week} fill={i === s.retention.length - 1 ? "hsl(var(--coral))" : "hsl(var(--aqua))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("impact.equity")}</p>
          <div className="mt-3 space-y-2.5">
            {equity.map((row) => (
              <div key={row.dimension.key} className="rounded-xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] text-foreground">{ar ? row.dimension.label.ar : row.dimension.label.en}</span>
                  {row.lagging ? (
                    <span className="text-[10.5px] text-muted-foreground">
                      {row.lagging.key} · {row.lagging.retention}% · n={row.lagging.n}
                    </span>
                  ) : (
                    <span className="text-[10.5px] text-muted-foreground/60">{ar ? "مجموعة صغيرة" : "group too small"}</span>
                  )}
                </div>
                {row.lagging && <p className="mt-1 text-[11px] leading-relaxed text-aqua/80">{ar ? row.lagging.fix.ar : row.lagging.fix.en}</p>}
              </div>
            ))}
          </div>
          {worst?.lagging && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber/25 bg-amber/[0.06] p-3 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
              {ar
                ? `أكبر فجوة: ${worst.lagging.key} عند ${worst.lagging.retention}%. الإصلاح المقترح مطبّق في الخطة، ويُقاس أسبوعيًا.`
                : `Widest gap: ${worst.lagging.key} at ${worst.lagging.retention}%. The suggested fix is applied in the plan and measured weekly.`}
            </p>
          )}
        </Card>
      </div>

      <Card className="mt-4 bg-secondary/25">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("impact.definition")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="text-[12px] leading-relaxed text-foreground">
            {ar
              ? "التغيير المستدام: السلوك ما زال قائمًا في الأسبوع الرابع وما بعده، مع تعافٍ خلال ٧ أيام من أي تعثّر."
              : "Sustained change: the behaviour is still present at week four and beyond, with a return within seven days of any lapse."}
          </p>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            {ar
              ? "المقاييس الزائفة: التنزيلات، وعدد مرات الفتح، والأوسمة التي تُمنح بلا عودة بعد التعثّر — لا تُحتسب هنا."
              : "Vanity metrics: downloads, app opens, and badges handed out with no return after a lapse — none of these are counted here."}
          </p>
        </div>
      </Card>

      <PersonalCard />

      <p className="mt-6 text-center text-[10.5px] leading-relaxed text-muted-foreground/60">
        {ar
          ? "كل الأرقام أعلاه من مجموعة اصطناعية مولّدة لغرض العرض. لا تمثل مشاركين حقيقيين، ولا تُستخدم في أي ادعاء طبي."
          : "Everything above comes from a generated synthetic cohort for demonstration. It does not represent real participants and is not used for any medical claim."}
      </p>
    </div>
  );
}

function PersonalCard() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [guest, setGuest] = useState(false);
  useEffect(() => setGuest(typeof window !== "undefined" && window.localStorage.getItem("bounce.guest") === "1"), []);
  // Anonymous visitors of the public dashboard never mount this, so no personal query runs.
  if (isLoadingAuth || (!isAuthenticated && !guest)) return null;
  return <AccountSummary />;
}