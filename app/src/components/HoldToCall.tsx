import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PHONE_TEL } from "@/lib/phone";

/**
 * HoldToCall — a small ritual.
 *
 * Press and hold: a ring of light completes over ~1.5s, then the phone
 * dials. It turns "tap a button" into a deliberate, significant act.
 * Falls back to a normal tap after the ring completes so it never traps
 * anyone.
 */
const HOLD_MS = 1500;

export default function HoldToCall({ label }: { label: string }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);
  const fired = useRef(false);

  const tick = (now: number) => {
    if (!start.current) start.current = now;
    const p = Math.min(1, (now - start.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      fire();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  const begin = () => {
    if (reduced) {
      fire();
      return;
    }
    cancelAnimationFrame(raf.current);
    start.current = 0;
    raf.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    cancelAnimationFrame(raf.current);
    if (!fired.current) setProgress(0);
    start.current = 0;
  };

  const fire = () => {
    if (fired.current) return;
    fired.current = true;
    setDone(true);
    window.location.href = PHONE_TEL;
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const R = 30;
  const C = 2 * Math.PI * R;

  return (
    <button
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className="group relative inline-flex select-none items-center gap-4 border border-gold-soft px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-gold-bright transition-colors hover:border-[hsl(var(--gold))]"
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        <svg viewBox="0 0 70 70" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="35" cy="35" r={R} fill="none" stroke="hsl(var(--gold) / 0.2)" strokeWidth="2.5" />
          <circle
            cx="35"
            cy="35"
            r={R}
            fill="none"
            stroke="hsl(var(--gold-bright))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        <span className={`h-2.5 w-2.5 rounded-full bg-[hsl(var(--gold-bright))] transition-transform ${progress > 0 ? "scale-125" : ""}`} />
      </span>
      <span>{done ? "Connecting…" : label}</span>
    </button>
  );
}
