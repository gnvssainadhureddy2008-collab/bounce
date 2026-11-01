import { AlertTriangle } from "lucide-react";

export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-4xl leading-none text-foreground sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm sm:p-6 ${className}`}>{children}</section>;
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-secondary/70 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-52 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="display text-2xl text-foreground">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorNote({ error, onRetry, retryLabel = "Try again" }) {
  if (!error) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive-foreground">
      <span className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        {error.message || String(error)}
      </span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rounded-full border border-destructive/40 px-3 py-1 text-xs">
          {retryLabel}
        </button>
      )}
    </div>
  );
}