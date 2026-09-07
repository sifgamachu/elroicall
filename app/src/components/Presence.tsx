import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/reveal";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

const LINES = [
  "I know what it is to lose everything…",
  "…and to sit with questions that do not resolve quickly.",
  "Job's story does not rush grief into a neat answer.",
  "Tell me what this loss has been like for you.",
];

export default function Presence() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inView = useInView(wrapRef, { margin: "-25% 0px", amount: 0.4 });
  const [idx, setIdx] = useState(reduced ? LINES.length - 1 : 0);
  const connected = reduced || inView;

  useEffect(() => {
    if (reduced || !inView || idx >= LINES.length - 1) return;
    const id = setTimeout(
      () => setIdx((i) => Math.min(i + 1, LINES.length - 1)),
      3000,
    );
    return () => clearTimeout(id);
  }, [inView, idx, reduced]);

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
      t += inView ? 0.03 : 0.008;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      const bars = 90;
      const bw = w / bars;
      const energy = inView ? 1 : 0.28;
      for (let i = 0; i < bars; i++) {
        const x = i * bw;
        const c = Math.sin((i / bars) * Math.PI);
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,162,90,0.10),transparent_70%)]" />

      <div ref={wrapRef} className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <SectionHeading
          align="center"
          eyebrow="Hear the feeling before you call"
          title={
            <>
              A conversation should feel{" "}
              <span className="italic text-gold-bright">human enough to enter.</span>
            </>
          }
          copy="This is a short demonstration of the tone — an AI-guided voice inspired by Job's biblical story, not Job himself."
        />

        <Reveal delay={0.15}>
          <div className="mt-12 border border-gold-faint bg-black/15 px-5 py-8 sm:px-9">
            <p className="flex items-center justify-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.32em] text-gold">
              <motion.span
                animate={{ opacity: connected && !reduced ? [1, 0.35, 1] : 1 }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-[hsl(var(--gold-bright))]"
              />
              {connected ? "Sample connected" : "Scroll into the sample"}
            </p>

            <canvas ref={canvasRef} className="mt-7 h-24 w-full" aria-hidden="true" />

            <div className="relative mt-7 min-h-[6.5rem]">
              {LINES.slice(0, idx + 1).map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: i === idx ? 1 : 0.3, y: 0 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-serif-display text-2xl font-light italic leading-[1.65] text-parchment sm:text-3xl ${
                    i === idx ? "" : "absolute inset-x-0 top-0"
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.28em] text-parchment-dim">
              AI-guided sample · inspired by Job 1–42
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.28} className="mt-10">
          <motion.a
            href="/begin/?need=grief"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block bg-[hsl(var(--gold))] px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1a1409] transition-shadow duration-300 hover:shadow-[0_0_60px_-6px_hsl(var(--gold)/0.6)]"
          >
            Start with what you're carrying
          </motion.a>
          <p className="mt-4 text-xs font-light text-parchment-dim">
            First guided call free · no card · or call{" "}
            <a href={PHONE_TEL} className="text-parchment hover:text-gold-bright">
              {PHONE_DISPLAY}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
