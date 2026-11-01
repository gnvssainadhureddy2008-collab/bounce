/** The wordmark: a heartbeat dot plus letterspaced display type. */
export default function Wordmark({ className = "", size = "text-lg" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="absolute h-2 w-2 rounded-full bg-aqua" style={{ boxShadow: "0 0 14px 3px rgba(95,227,200,0.55)" }} />
      </span>
      <span className={`display uppercase tracking-[0.34em] text-sand ${size}`}>Bounce</span>
    </span>
  );
}