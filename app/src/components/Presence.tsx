import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/reveal";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

/**
 * Presence — the call connects, and a voice answers.
 *
 * Instead of a chat transcript, the screen dims to a warm vignette and a
 * golden waveform breathes as a voice line is "spoken." The words surface
 * as the voice delivers them. You're not reading a conversation — you're
 * in the moment a presence answers.
 */
const LINES = [
  "I know what it is to lose everything…",
  "…and to learn that God never once left.",
  "He saw me in the ash heap, and He sees you now.",
  "Tell me what's keeping you up tonight. I'm not going anywhere.",
];

export default function Presence() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inView = useInView(wrapRef, { margin: "-25% 0px", amount: 0.4 });
  const [idx, setIdx] = useState(reduced ? LINES.length - 1 : 0);
  const [connected, setConnected] = useState(false);

  // step the spoken lines
  useEffect(() => {
    if (reduced) return;
    if (!inView) return;
    setConnected(true);
    if (idx >= LINES.length - 1) return;
    const id = setTimeout(() => setIdx((i) => Math.min(i + 1, LINES.length - 1)), 3400);
    return () => clearTimeout(id);
  }, [inView, idx, reduced]);

  // the breathing waveform
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const draw = () => {
      t += inView ? 0.03 : 0.008; // speaks faster when "live"
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      const bars = 90;
      const bw = w / bars;
      const energy = inView ? 1 : 0.28;
      for (let i = 0; i < bars; i++) {
        const x = i * bw;
        const c = Math.sin((i / bars) * Math.PI); // envelope, quiet at edges
        // layered, irregular — the cadence of a human voice, not a machine
        const n =
          Math.sin(t * 1.9 + i * 0.28) * 0.42 +
          Math.sin(t * 3.1 + i * 0.09) * 0.26 +
          Math.sin(t * 0.9 + i * 0.44) * 0.2 +
          Math.sin(t * 4.7 + i * 0.16) * 0.12;
        const amp = Math.abs(n) * c * mid * 0.9 * energy + 1.5;
        const g = ctx.createLinearGradient(x, mid - amp, x, mid + amp);
        g.addColorStop(0, "rgba(158,113,38,0.14)");
        g.addColorStop(0.5, "rgba(158,113,38,0.9)");
        g.addColorStop(1, "rgba(158,113,38,0.14)");
        ctx.fillStyle = g;
        // softer, rounded bars — warmer, less digital
        const bx = x + bw * 0.24;
        const bwidth = bw * 0.52;
        const r = Math.min(bwidth / 2, amp);
        ctx.beginPath();
        ctx.roundRect(bx, mid - amp, bwidth, amp * 2, r);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [inView, reduced]);

  return (
    <section className="relative overflow-hidden border-y border-gold-faint bg-ink-2">
      {/* warm vignette of the moment */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,162,90,0.10),transparent_70%)]" />

      <div ref={wrapRef} className="relative mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
        <SectionHeading
          align="center"
          eyebrow="The God Who Sees"
          title={
            <>
              And then —{" "}
              <span className="italic text-gold-bright">a voice answers.</span>
            </>
          }
        />

        <Reveal delay={0.15}>
          <div className="mt-14">
            {/* connection state */}
            <p className="flex items-center justify-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.35em] text-gold">
              <motion.span
                animate={{ opacity: connected && !reduced ? [1, 0.3, 1] : 1 }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-[hsl(var(--gold-bright))]"
              />
              {connected || reduced ? "Connected · first call free" : "The line is open"}
            </p>

            {/* the living waveform */}
            <canvas ref={canvasRef} className="mt-8 h-28 w-full" aria-hidden="true" />

            {/* the spoken words */}
            <div className="relative mt-8 min-h-[6.5rem]">
              {LINES.slice(0, idx + 1).map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: i === idx ? 1 : 0.35, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-serif-display text-2xl font-light italic leading-[1.7] text-parchment sm:text-3xl ${
                    i === idx ? "" : "absolute inset-x-0 top-0"
                  }`}
                >
                  {l}
                </motion.p>
              ))}
            </div>

            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-parchment-dim">
              Job · on grief
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.3} className="mt-12">
          <motion.a
            href={PHONE_TEL}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block bg-[hsl(var(--gold))] px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#1a1409] transition-shadow duration-300 hover:shadow-[0_0_60px_-6px_hsl(var(--gold)/0.6)]"
          >
            Hear This Voice — Free
          </motion.a>
          <p className="mt-4 text-xs font-light text-parchment-dim">
            {PHONE_DISPLAY} · first call free · no account, no card
          </p>
        </Reveal>
      </div>
    </section>
  );
}
