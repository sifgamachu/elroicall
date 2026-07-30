import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { WITNESSES, type Need } from "@/lib/witnesses";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import Magnetic from "@/components/Magnetic";

/**
 * Encounter — "Whom do you need tonight?"
 *
 * The burdens hang as glowing presences. Dwelling on one warms the space
 * and draws the matching witness forward — but now every need opens onto
 * the whole of Scripture, not a single name. The first voice rises here;
 * the rest of the sky waits below in the Cloud of Witnesses.
 */
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
  shame: "I'm ashamed",
  burnout: "I'm burned out",
  unanswered: "My prayers feel unanswered",
  unqualified: "I feel unqualified",
  "starting over": "I'm starting over",
  unseen: "I feel unseen",
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

  // how many voices answer this need across the whole Bible
  const count = active ? WITNESSES.filter((w) => w.need === active).length : 0;

  return (
    <section id="tonight" className="relative overflow-hidden">
      {/* atmosphere that warms to the active presence */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: active != null ? 1 : 0.5 }}
        transition={{ duration: 1.4 }}
        style={{
          background:
            "radial-gradient(ellipse 72% 55% at 50% 42%, hsl(var(--gold-bright)/0.16), hsl(var(--gold-bright)/0.04) 55%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-28 text-center sm:py-36">
        <p className="eyebrow">He Sees You</p>
        <h2 className="font-serif-display mt-6 text-4xl font-light leading-tight tracking-tight text-parchment sm:text-6xl">
          Whom do you need{" "}
          <span className="italic text-gold-bright">tonight?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-parchment-dim">
          Hagar named Him <em className="font-serif-display text-parchment">El Roi</em> — the God who sees.
          Dwell on what you carry, and be seen.
        </p>

        {/* the presences */}
        <div className="mt-14 flex flex-wrap items-stretch justify-center gap-3 sm:gap-4">
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
                whileHover={reduced ? undefined : { y: -4, scale: 1.04 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className={`relative rounded-full border px-5 py-3 text-[13px] font-light tracking-wide backdrop-blur-sm transition-colors duration-500 sm:px-6 ${
                  isActive
                    ? "border-[hsl(var(--gold-bright))] bg-[hsl(var(--gold-bright)/0.16)] text-parchment shadow-[0_0_50px_-6px_hsl(var(--gold-bright)/0.6)]"
                    : "border-gold-faint bg-white/[0.03] text-parchment-dim hover:border-gold-soft hover:text-parchment"
                }`}
              >
                {isActive && !reduced && (
                  <motion.span
                    layoutId="presenceGlow"
                    className="absolute inset-0 rounded-full bg-[hsl(var(--gold-bright)/0.12)]"
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  />
                )}
                <span className="relative">{PILL_LABEL[n]}</span>
              </motion.button>
            );
          })}
        </div>

        {/* the voice that answers */}
        <div className="relative mt-16 min-h-[15rem]">
          <AnimatePresence mode="wait">
            {witness ? (
              <motion.div
                key={witness.name}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(8px)", scale: 0.98 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, filter: "blur(8px)", scale: 0.99 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-2xl"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
                  He sees — and hands you to
                </p>
                <p className="font-serif-display mt-3 text-6xl font-light italic text-glory drop-shadow-[0_0_35px_hsl(var(--gold-bright)/0.5)] sm:text-7xl">
                  {witness.name}
                </p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.3em] text-parchment-dim/70">
                  {witness.ref}
                </p>
                <p className="font-serif-display mx-auto mt-6 max-w-xl text-xl font-light italic leading-[1.85] text-parchment sm:text-2xl">
                  "{witness.line}"
                </p>
                <p className="mt-6 text-[12px] font-light text-parchment-dim">
                  And <span className="font-serif-display italic text-gold-bright">{count - 1 === 0 ? "no other" : `${count - 1} more`}</span> in
                  the sky below bore this too.
                </p>
                <div className="mt-8">
                  <Magnetic strength={0.28}>
                    <motion.a
                      href={PHONE_TEL}
                      whileTap={{ scale: 0.96 }}
                      className="group relative inline-flex items-center gap-3 overflow-hidden bg-[hsl(var(--gold-bright))] px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0a0c14] transition-shadow duration-500 hover:shadow-[0_0_80px_-6px_hsl(var(--gold-bright)/0.85)]"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative">Talk to {witness.name} — first call free</span>
                    </motion.a>
                  </Magnetic>
                  <p className="mt-3.5 text-[11.5px] font-light text-parchment-dim/80">
                    {PHONE_DISPLAY} · no account, no card
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                className="font-serif-display pt-10 text-xl font-light italic text-parchment-dim"
              >
                …He is already watching over you.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
