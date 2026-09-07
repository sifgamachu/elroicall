import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Phone, ShieldCheck, Volume2 } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

const fade = (delay: number, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.05, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const NEEDS = [
  { label: "I'm grieving", value: "grief" },
  { label: "I'm afraid", value: "fear" },
  { label: "I can't let go of what I did", value: "shame" },
  { label: "I'm running on empty", value: "burnout" },
  { label: "I feel unseen", value: "unseen" },
  { label: "I need direction", value: "calling" },
];

export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.88], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-svh items-center overflow-hidden border-b border-gold-faint"
    >
      <motion.div style={reduced ? undefined : { y: bgY }} className="absolute inset-0">
        <motion.img
          src="/images/hero-desert.jpg"
          alt="A stone well in the desert at dawn"
          className="h-full w-full scale-105 object-cover opacity-36"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 7, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,10,0.98)_0%,rgba(8,8,10,0.88)_45%,rgba(8,8,10,0.58)_74%,rgba(8,8,10,0.76)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_68%_55%_at_72%_20%,hsl(var(--gold-bright)/0.23),transparent_66%)]" />
      </motion.div>

      <div className="pointer-events-none absolute -right-20 top-10 h-[34rem] w-[34rem] rounded-full border border-[hsl(var(--gold-bright)/0.12)]" />
      <div className="pointer-events-none absolute right-24 top-44 h-[18rem] w-[18rem] rounded-full border border-[hsl(var(--gold-bright)/0.2)]" />

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: fadeOut }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 pb-24 pt-32 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-10"
      >
        <div className="max-w-2xl text-left">
          <motion.p {...fade(0.08)} className="eyebrow">
            El Roi Call · The God Who Sees
          </motion.p>

          <motion.h1
            {...fade(0.16)}
            className="font-serif-display mt-7 text-5xl font-light leading-[1.02] tracking-tight text-parchment sm:text-6xl lg:text-7xl"
          >
            You do not need the right words.
            <span className="block italic text-gold-bright">Start with the true ones.</span>
          </motion.h1>

          <motion.p
            {...fade(0.24)}
            className="mt-7 max-w-xl text-base font-light leading-[1.85] text-parchment-dim sm:text-lg"
          >
            One calm AI guide listens first. Then, when a story from Scripture fits what you're carrying,
            the guide brings you into it — Job for grief, Hagar for feeling unseen, Esther for fear, Ruth for starting again.
            Not a character performance. A conversation that keeps returning to you, Scripture, and prayer.
          </motion.p>

          <motion.blockquote
            {...fade(0.32)}
            className="mt-9 border-l border-gold-soft/60 pl-5 font-serif-display text-xl font-light italic leading-relaxed text-parchment/90"
          >
            “You are the God who sees me.”
            <span className="mt-2 block font-sans text-[10px] not-italic uppercase tracking-[0.3em] text-gold">
              Genesis 16:13
            </span>
          </motion.blockquote>

          <motion.div {...fade(0.4)} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/begin/"
              className="group inline-flex items-center gap-3 bg-[hsl(var(--gold-bright))] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#111015] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-22px_hsl(var(--gold-bright)/0.8)]"
            >
              Meet the guide
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 border border-gold-faint px-6 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-parchment transition-colors hover:border-gold-soft hover:text-gold-bright"
            >
              <Phone className="h-4 w-4" />
              Prefer to call
            </a>
          </motion.div>

          <motion.div {...fade(0.48)} className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-light text-parchment-dim">
            <span className="inline-flex items-center gap-1.5"><Volume2 className="h-3 w-3 text-gold" />One familiar AI voice</span>
            <span>·</span>
            <span>Whole Scripture</span>
            <span>·</span>
            <span>First call free</span>
            <span>·</span>
            <span>No card</span>
          </motion.div>
        </div>

        <motion.aside
          {...fade(0.22, 18)}
          className="relative mx-auto w-full max-w-xl border border-gold-soft/35 bg-[#111013]/90 p-6 shadow-[0_38px_120px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8"
        >
          <div className="absolute -left-px top-10 h-20 w-px bg-gold" />
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
            The guide starts by listening
          </p>
          <h2 className="font-serif-display mt-4 text-3xl font-light text-parchment sm:text-4xl">
            What is closest to your life today?
          </h2>
          <p className="mt-3 text-[13px] font-light leading-relaxed text-parchment-dim">
            Pick one if it helps. Or skip the labels and say it in your own words.
          </p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {NEEDS.map((need) => (
              <a
                key={need.value}
                href={`/begin/?need=${need.value}`}
                className="group flex min-h-12 items-center justify-between border border-white/10 bg-white/[0.025] px-4 py-3 text-left text-[13px] font-light text-parchment transition-all hover:border-gold-soft/70 hover:bg-[hsl(var(--gold)/0.08)]"
              >
                <span>{need.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gold opacity-60 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </a>
            ))}
          </div>

          <a
            href="/begin/"
            className="mt-4 flex w-full items-center justify-center gap-2 border border-gold-soft/50 px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-bright transition-colors hover:bg-[hsl(var(--gold)/0.08)]"
          >
            I'll say it in my own words
          </a>

          <div className="mt-7 border-t border-white/8 pt-5">
            <div className="flex items-start gap-3 text-[11px] font-light leading-relaxed text-parchment-dim">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <p>
                The same AI guide stays with you across scenarios. Biblical people are introduced as stories from Scripture — never impersonated as if they are literally on the line. El Roi Call is not therapy, clergy, medical care, or crisis support.
              </p>
            </div>
            <a
              href={PHONE_TEL}
              className="font-serif-display mt-5 block text-center text-2xl font-light tracking-[0.09em] text-parchment transition-colors hover:text-gold-bright"
            >
              {PHONE_DISPLAY}
            </a>
          </div>
        </motion.aside>
      </motion.div>

      <motion.a
        href="#tonight"
        aria-label="Continue to find a biblical story"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-parchment-dim/60 transition-colors hover:text-gold-bright"
        animate={reduced ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="h-5 w-5" />
      </motion.a>
    </section>
  );
}
