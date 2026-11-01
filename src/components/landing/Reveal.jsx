import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1];

/** A quiet rise into view — used for every block on the landing page. */
export function Reveal({ children, delay = 0, y = 20, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Line-by-line masked reveal for cinematic titles.
 * The visibility trigger sits on the wrapper (which always has height); the masked
 * lines are children driven by variants — observing a child that starts clipped
 * outside its own overflow box would never fire.
 */
export function MaskLines({ lines, className = "", lineClassName = "", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`block ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8%" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.11, delayChildren: delay } },
      }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            variants={{
              hidden: { y: reduce ? "0%" : "110%" },
              show: { y: "0%" },
            }}
            transition={{ duration: 1.05, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Count-up that only runs in the browser, so server and client markup agree. */
export function CountUp({ to, suffix = "", prefix = "", duration = 1600, decimals = 0 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) { setValue(to); return undefined; }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") { setValue(to); return undefined; }
    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [to, duration, reduce]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function Eyebrow({ children, className = "" }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}