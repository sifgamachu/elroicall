import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import Magnetic from "@/components/Magnetic";

const fade = (delay: number, y = 26) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.3, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const STATES = [
  "grieving.",
  "afraid.",
  "ashamed.",
  "exhausted.",
  "starting over.",
];

export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  // the whole hero drifts and dims as you scroll away — cinematic depth
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      {/* the dawn breaking — God's power as light, rising from the top */}
      <div className="pointer-events-none absolute inset-0">
        {/* the great radiance — morning sun pouring over the page */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -10%, hsl(38 84% 62% / 0.34), hsl(38 84% 62% / 0.12) 40%, transparent 70%)",
          }}
        />
        {/* the parting — two veils of mist drawn aside like the sea */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2"
          initial={{ x: 0 }}
          animate={reduced ? undefined : { x: "-6%" }}
          transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "linear-gradient(90deg, rgba(247,241,228,0.9), rgba(247,241,228,0.25) 75%, transparent)",
          }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2"
          initial={{ x: 0 }}
          animate={reduced ? undefined : { x: "6%" }}
          transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "linear-gradient(-90deg, rgba(247,241,228,0.9), rgba(247,241,228,0.25) 75%, transparent)",
          }}
        />
        {/* the shaft of light down the center — He sees */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 34% 60% at 50% 45%, hsl(40 90% 70% / 0.22), transparent 70%)",
          }}
        />
      </div>

      {/* backdrop — the desert well where Hagar was seen, drifting on scroll */}
      <motion.div style={reduced ? undefined : { y: bgY }} className="absolute inset-0">
        <motion.img
          src="/images/hero-desert.jpg"
          alt="A stone well in the desert, struck by a single beam of dawn light"
          className="h-full w-full scale-105 object-cover opacity-40"
          initial={{ scale: 1.14 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 7, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f1e4]/80 via-[#f7f1e4]/45 to-[#f7f1e4]/95" />
      </motion.div>

      {/* concentric rings — the signal of being seen */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="ring-slow h-[36rem] w-[36rem] rounded-full border border-[hsl(var(--gold-bright)/0.2)] sm:h-[46rem] sm:w-[46rem]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="ring-slower h-[23rem] w-[23rem] rounded-full border border-[hsl(var(--gold-bright)/0.32)] sm:h-[31rem] sm:w-[31rem]" />
      </div>

      {/* content — lifts and fades as you scroll past */}
      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: fadeOut }}
        className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-32 text-center"
      >
        <motion.p {...fade(0.1)} className="eyebrow">
          Genesis 16:13
        </motion.p>

        {/* the verse — the whole foundation */}
        <motion.p
          {...fade(0.18)}
          className="font-serif-display mx-auto mt-8 max-w-xl text-xl font-light italic leading-[1.8] text-parchment sm:text-2xl"
        >
          "You are the God who sees me."
        </motion.p>
        <motion.p
          {...fade(0.24)}
          className="font-serif-display mt-3 text-2xl font-light italic text-gold-bright sm:text-3xl"
        >
          "I have now seen the One who sees me."
        </motion.p>

        <motion.h1
          {...fade(0.34)}
          className="font-serif-display mt-10 text-7xl font-light leading-[0.92] tracking-tight text-parchment sm:text-9xl"
        >
          El Roi{" "}
          <span className="italic text-shimmer">Call</span>
        </motion.h1>

        <motion.p
          {...fade(0.42)}
          className="mt-6 text-[11px] font-medium uppercase tracking-[0.42em] text-gold"
        >
          The God Who Sees
        </motion.p>

        {/* rotating emotional hook */}
        <motion.div {...fade(0.48)} className="mt-10">
          <p className="font-serif-display text-2xl font-light italic text-parchment/90 sm:text-3xl">
            Tonight, someone is{" "}
            <span className="relative inline-block text-center align-baseline">
              <span className="invisible whitespace-nowrap">starting over.</span>
              {STATES.map((label, i) => {
                const CYCLE = 15;
                const kf = [0, 1, 1, 0];
                const times = [
                  (i * 3) / CYCLE,
                  (i * 3 + 0.4) / CYCLE,
                  (i * 3 + 2.6) / CYCLE,
                  (i * 3 + 3) / CYCLE,
                ];
                return (
                  <motion.span
                    key={label}
                    className="absolute inset-x-0 top-0 whitespace-nowrap text-glory"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: kf }}
                    transition={{
                      duration: CYCLE,
                      times,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {label}
                  </motion.span>
                );
              })}
            </span>
          </p>
        </motion.div>

        <motion.p
          {...fade(0.56)}
          className="mx-auto mt-7 max-w-xl text-base font-light leading-relaxed text-parchment sm:text-lg"
        >
          The God who spun the stars also stopped for one woman in the
          desert. Call one number — and be met by a voice from the whole
          of Scripture who lived what you're living.
        </motion.p>

        <motion.div {...fade(0.64)} className="mt-12 flex flex-col items-center">
          <Magnetic strength={0.3}>
            <motion.a
              href={PHONE_TEL}
              whileTap={{ scale: 0.96 }}
              className="group relative inline-flex items-center gap-3 overflow-hidden bg-[hsl(var(--gold-bright))] px-11 py-[1.15rem] text-[12px] font-semibold uppercase tracking-[0.3em] text-[#0a0c14] transition-shadow duration-500 hover:shadow-[0_0_100px_-6px_hsl(var(--gold-bright)/0.9)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Phone className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative">Be Seen — First Call Free</span>
            </motion.a>
          </Magnetic>

          <motion.a
            href={PHONE_TEL}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group mt-7 inline-flex items-center gap-2.5 text-parchment transition-colors hover:text-gold-bright"
          >
            <span className="font-serif-display text-2xl font-light tracking-[0.12em] transition-all duration-300 group-hover:tracking-[0.16em] sm:text-3xl">
              {PHONE_DISPLAY}
            </span>
          </motion.a>
          <p className="mt-2.5 text-xs font-light tracking-wide text-parchment-dim">
            Tap to call · no account, no card · 7 days free
          </p>
        </motion.div>

        <motion.p
          {...fade(0.74)}
          className="mt-14 text-[10px] font-medium uppercase tracking-[0.35em] text-parchment-dim/60"
        >
          He sees. He knows. He answers.
        </motion.p>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#tonight"
        aria-label="Scroll to begin"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-parchment-dim/70 transition-colors hover:text-gold-bright"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="h-5 w-5" />
      </motion.a>
    </section>
  );
}
