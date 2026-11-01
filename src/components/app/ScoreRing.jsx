/** Animated progress ring — used for resilience and recovery. */
export default function ScoreRing({ value = 0, size = 132, stroke = 9, children, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label || "score"}: ${pct}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--aqua))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 10px hsl(var(--aqua)/0.45))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children ?? <span className="display text-3xl text-foreground">{pct}</span>}</div>
    </div>
  );
}