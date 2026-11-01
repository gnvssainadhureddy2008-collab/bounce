import { createFileRoute } from "@tanstack/react-router";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, GripVertical, Sparkles } from "lucide-react";
import { Card, ErrorNote, PageHeader, PageSkeleton } from "@/components/app/States";
import { addDays, isoDate, weekdayShort } from "@/lib/engine";
import { usePrefs } from "@/lib/PrefsContext";
import { useAccount } from "@/lib/useAccount";
import { updateOne } from "@/lib/store";

export const Route = createFileRoute("/_app/plan")({
  head: () => ({ meta: [{ title: "Plan — Bounce" }] }),
  component: PlanPage,
});

function PlanPage() {
  const acc = useAccount();
  const { t, lang } = usePrefs();
  const ar = lang === "ar";
  const [view, setView] = useState("week");
  const [offset, setOffset] = useState(0);
  const today = isoDate();

  if (acc.loading) return <PageSkeleton />;
  if (acc.error) return <ErrorNote error={acc.error} onRetry={acc.reload} retryLabel={t("common.tryAgain")} />;

  const start = addDays(today, offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const actions = acc.actions.filter((a) => a.behavior !== "checkin");
  const byDate = (date) => actions.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time));

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const id = result.draggableId;
    const date = result.destination.droppableId;
    if (result.source.droppableId === date) return;
    try {
      await updateOne("actions", id, { date });
      await acc.reload();
      toast.success(ar ? "أُعيدت الجدولة." : "Rescheduled.");
    } catch (error) {
      toast.error(error.message || String(error));
    }
  };

  const monthDays = Array.from({ length: 28 }, (_, i) => addDays(today, i - 3));

  return (
    <>
      <PageHeader
        title={t("plan.title")}
        subtitle={t("plan.subtitle")}
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border p-0.5">
              {["week", "month"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${view === v ? "bg-sand text-[#06161c]" : "text-muted-foreground"}`}
                >
                  {t(v === "week" ? "plan.week" : "plan.month")}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {view === "week" ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => setOffset(offset - 1)} className="rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground">
              {ar ? "الأسبوع السابق" : "Previous week"}
            </button>
            <span className="text-[12px] text-muted-foreground">{start} → {addDays(start, 6)}</span>
            <button type="button" onClick={() => setOffset(offset + 1)} className="rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground">
              {ar ? "الأسبوع التالي" : "Next week"}
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-2">
              {days.map((date) => {
                const list = byDate(date);
                const isToday = date === today;
                return (
                  <Droppable droppableId={date} key={date}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-2xl border p-3 transition-colors ${snapshot.isDraggingOver ? "border-aqua/50 bg-aqua/[0.06]" : isToday ? "border-aqua/25 bg-card/50" : "border-border/60 bg-card/30"}`}
                      >
                        <div className="mb-2 flex items-center gap-2 px-1">
                          <span className={`text-[12.5px] ${isToday ? "text-aqua" : "text-foreground"}`}>
                            {weekdayShort(date, lang)} · {date.slice(5)}
                          </span>
                          {isToday && <span className="rounded-full bg-aqua/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-aqua">{t("common.today")}</span>}
                          <span className="ms-auto text-[10.5px] text-muted-foreground">{list.length}</span>
                        </div>
                        <div className="space-y-1.5">
                          {list.map((a, index) => (
                            <Draggable draggableId={a.id} index={index} key={a.id}>
                              {(dp, ds) => (
                                <div
                                  ref={dp.innerRef}
                                  {...dp.draggableProps}
                                  {...dp.dragHandleProps}
                                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${ds.isDragging ? "border-aqua bg-card shadow-xl" : "border-border/60 bg-background/50"}`}
                                >
                                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[12.5px] text-foreground">{a.title}</span>
                                    <span className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                                      <Sparkles className="h-3 w-3 text-aqua/70" /> {t("plan.suggested")} {a.time} · {a.size}
                                    </span>
                                  </span>
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] ${a.status === "done" ? "bg-aqua/15 text-aqua" : a.status === "skipped" ? "bg-secondary text-muted-foreground" : "text-muted-foreground"}`}>
                                    {a.status}
                                  </span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {list.length === 0 && <p className="px-1 py-2 text-[11px] text-muted-foreground/60">—</p>}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => weekdayShort(addDays(today, i), lang)).map((d, i) => (
            <div key={`${d}-${i}`} className="pb-1 text-center text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{d}</div>
          ))}
          {monthDays.map((date) => {
            const list = byDate(date);
            return (
              <div
                key={date}
                className={`min-h-[76px] rounded-xl border p-1.5 ${date === today ? "border-aqua/40 bg-aqua/[0.06]" : "border-border/50 bg-card/30"}`}
              >
                <p className="text-[10.5px] text-muted-foreground">{date.slice(8)}</p>
                <div className="mt-1 space-y-1">
                  {list.slice(0, 2).map((a) => (
                    <p key={a.id} className={`truncate rounded px-1 py-0.5 text-[9.5px] ${a.status === "done" ? "bg-aqua/15 text-aqua" : "bg-secondary/70 text-foreground/80"}`}>
                      {a.time} {a.behavior}
                    </p>
                  ))}
                  {list.length > 2 && <p className="text-[9px] text-muted-foreground">+{list.length - 2}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card className="bg-secondary/25">
          <p className="flex items-center gap-2 text-[11px] text-foreground"><CalendarDays className="h-3.5 w-3.5 text-aqua" />{t("plan.balance")}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {ar ? "لا يزيد أي سلوك عن خطوة واحدة يوميًا." : "No behaviour gets more than one step a day."}
          </p>
        </Card>
        {acc.settings?.fasting_aware && (
          <Card className="bg-secondary/25">
            <p className="text-[11px] text-foreground">{t("plan.ramadan")}</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              {ar ? "تُنقل الخطوات الظهرية إلى بعد الغروب." : "Midday steps move after sunset."}
            </p>
          </Card>
        )}
        <Card className="bg-secondary/25">
          <p className="text-[11px] text-foreground">{t("plan.heat")}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {ar ? "في أشهر الصيف تُقترح الحركة قبل التاسعة صباحًا." : "In summer months movement is suggested before 9am."}
          </p>
        </Card>
      </div>
    </>
  );
}