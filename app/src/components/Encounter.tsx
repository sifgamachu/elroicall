import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { WITNESSES, type Need } from "@/lib/witnesses";
import { PHONE_DISPLAY } from "@/lib/phone";
import Magnetic from "@/components/Magnetic";

const FEATURE: Record<Need, string> = {
  grief: "Job",
  fear: "Esther",
  shame: "Peter",
  burnout: "Elijah",
  unanswered: "Hannah",
  unqualified: "Moses",
  "starting over": "Ruth",
  unseen: "Hagar",
  calling: "Nehemiah",
};

const PILL_LABEL: Record<Need, string> = {
  grief: "I'm grieving",
  fear: "I'm afraid",
  shame: "I can't let go of what I did",
  burnout: "I'm running on empty",
  unanswered: "My prayers feel unanswered",
  unqualified: "I don't feel ready",
  "starting over": "I'm starting over",
  unseen: "I feel invisible",
  calling: "I need direction",
};

const NEED_ORDER: Need[] = [
  "grief",
  "fear",
  "shame",
  "burnout",
  "unqualified",
  "unanswered",
  "starting over",
  "unseen",
  "calling",
];

export default function Encounter() {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<Need | null>(null);
  const [chosen, setChosen] = useState<Need | null>(null);
  const active = chosen ?? hover;

  const witness = active
    ? WITNESSES.find((w) => w.name === FEATURE[active]) ?? null
    : null;

  const count = active ? WITNESSES.filter((w) => w.need === active).length : 0;

  return (
    <section id="tonight" className="relative overflow-hidden bg-[#0d0c0f]">
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: active != null ? 1 : 0.5 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            "radial-gradient(ellipse 72% 55% at 50% 42%, hsl(var(--gold-bright)/0.13), hsl(var(--gold-bright)/0.035) 55%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
        <p className="eyebrow">You can start with one honest thing</p>
        <h2 className="font-serif-display mt-6 text-4xl font-light leading-tight tracking-tight text-parchment sm:text-6xl">
          What feels <span className="italic text-gold-bright">heaviest</span> right now?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-parchment-dim">
          You do not need to know which biblical story fits. Choose what comes closest to your life today,
          and we'll show you a story from Scripture that has walked through similar ground.
        </p>

        <div className="mt-12 flex flex-wrap items-stretch justify-center gap-3 sm:gap-4">
          {NEED_ORDER.map((n) => {
            const isActive = active === n;
            return (
              <motion.button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(null)}
                onClick={() => setChosen(n)}
                whileHover={reduced ? undefined : { y: -3, scale: 1.02 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`relative rounded-full border px-5 py-3 text-[13px] font-light tracking-wide backdrop-blur-sm transition-colors duration-300 sm:px-6 ${
                  isActive
                    ? "border-[hsl(var(--gold-bright))] bg-[hsl(var(--gold-bright)/0.14)] text-parchment shadow-[0_0_46px_-10px_hsl(var(--gold-bright)/0.62)]"
                    : "border-white/10 bg-white/[0.025] text-parchment-dim hover:border-gold-soft hover:text-parchment"
                }`}
              >
                {isActive && !reduced && (
                  <motion.span
                    layoutId="presenceGlow"
                    className="absolute inset-0 rounded-full bg-[hsl(var(--gold-bright)/0.09)]"
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  />
                )}
                <span className="relative">{PILL_LABEL[n]}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="relative mt-14 min-h-[16rem]">
          <AnimatePresence mode="wait">
            {witness && active ? (
              <motion.div
                key={`${witness.name}-${active}`}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-3xl border border-gold-faint bg-[#131116]/80 px-6 py-8 shadow-[0_28px_90px_-50px_rgba(0,0,0,1)] backdrop-blur-md sm:px-10"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-gold">
                  A biblical story that may meet you here
                </p>
                <p className="font-serif-display mt-3 text-5xl font-light italic text-glory sm:text-6xl">
                  {witness.name}
                </p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-parchment-dim/70">
                  {witness.ref}
                </p>
                <p className="font-serif-display mx-auto mt-6 max-w-xl text-xl font-light italic leading-[1.75] text-parchment sm:text-2xl">
                  “{witness.line}”
                </p>
                <p className="mx-auto mt-6 max-w-xl text-[12px] font-light leading-relaxed text-parchment-dim">
                  This is an AI-guided voice inspired by {witness.name}'s scriptural story — not the actual biblical person.
                  {count > 1 ? ` There are ${count - 1} other witnesses in Scripture connected to this need too.` : ""}
                </p>
                <div className="mt-8">
                  <Magnetic strength={0.24}>
                    <motion.a
                      href={`/begin/?need=${encodeURIComponent(active)}`}
                      whileTap={{ scale: 0.97 }}
                      className="group relative inline-flex items-center gap-3 overflow-hidden bg-[hsl(var(--gold-bright))] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a0c14] transition-shadow duration-300 hover:shadow-[0_0_70px_-10px_hsl(var(--gold-bright)/0.8)]"
                    >
                      <span className="relative">Continue with {witness.name}'s story</span>
                    </motion.a>
                  </Magnetic>
                  <p className="mt-3 text-[11.5px] font-light text-parchment-dim/80">
                    First call free · no card · or call {PHONE_DISPLAY}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-xl pt-7"
              >
                <p className="font-serif-display text-2xl font-light italic text-parchment/80">
                  Pick the sentence that feels closest. You can change your mind at any time.
                </p>
                <p className="mt-4 text-[12px] font-light leading-relaxed text-parchment-dim">
                  There is no wrong answer here. The goal is not to label you — only to help you begin.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
