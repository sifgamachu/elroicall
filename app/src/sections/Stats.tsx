import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal, GoldRule } from "@/components/reveal";

function Counter({
  target,
  suffix = "",
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 40, suffix: "+", label: "voices who lived it" },
  { value: 1, suffix: "", label: "number to remember" },
  { value: 72, suffix: "h", label: "then prayers are destroyed" },
  { value: 2000, suffix: "yrs", label: "of wisdom on the line" },
];

export default function Stats() {
  return (
    <section className="relative">
      <GoldRule />
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="font-serif-display text-5xl font-light text-gold-bright sm:text-6xl">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.28em] text-parchment-dim">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <GoldRule />
    </section>
  );
}
