import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { WITNESSES, NEEDS, type Witness, type Need } from "@/lib/witnesses";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import Magnetic from "@/components/Magnetic";

/**
 * The Cloud of Witnesses.
 *
 * "Surrounded by so great a cloud of witnesses" — every voice Scripture
 * gives us, scattered as stars across the heavens. Filter the sky by the
 * burden you carry; each witness is a star that brightens as you near it.
 * Choose one and they are drawn down out of the sky to speak.
 *
 * This is Genesis 16:13 made visible: a God whose power spun these
 * stars — and whose care sees the single one you reach for.
 */
export default function CloudOfWitnesses() {
  const reduced = useReducedMotion();
  const [need, setNeed] = useState<Need | "all">("all");
  const [selected, setSelected] = useState<Witness | null>(null);

  // keeping stars — the visitor gathers their sky, remembered on this device
  const [keptNames, setKeptNames] = useState<string[]>([]);
  useEffect(() => {
    try {
      setKeptNames(JSON.parse(localStorage.getItem("elroi-kept-stars") ?? "[]"));
    } catch {
      /* private mode — the sky resets */
    }
  }, []);
  const toggleKept = (name: string) => {
    setKeptNames((prev) => {
      const next = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      try {
        localStorage.setItem("elroi-kept-stars", JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  };
  const kept = useMemo(() => new Set(keptNames), [keptNames]);

  const sky = useMemo(() => {
    const list = need === "all" ? WITNESSES : WITNESSES.filter((w) => w.need === need);
    // deterministic scatter so the sky is stable between renders
    return list.map((w, i) => {
      const seed = (w.name.length * 37 + i * 61) % 100;
      const seed2 = (w.name.charCodeAt(0) * 53 + i * 29) % 100;
      return {
        w,
        x: 6 + (seed / 100) * 88,
        y: 8 + (seed2 / 100) * 66,
        big: i % 5 === 0,
      };
    });
  }, [need]);

  return (
    <section id="witnesses" className="relative overflow-hidden border-y border-gold-faint bg-[#ece6d6]">
      {/* the heavens — brighter toward the top, like dawn gathering */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--gold-bright)/0.1),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36">
        <div className="text-center">
          <p className="eyebrow">Hebrews 12:1</p>
          <h2 className="font-serif-display mt-6 text-4xl font-light leading-tight tracking-tight text-parchment sm:text-6xl">
            So great a{" "}
            <span className="italic text-gold-bright">cloud of witnesses</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-parchment-dim">
            Not a handful. <em className="font-serif-display text-parchment">Every voice Scripture gives us</em> —
            patriarchs and prophets, the women God saw, the broken He raised —
            each a star in His sky. Reach in. Find the one who lived what you're living.
          </p>
        </div>

        {/* search the sky by burden */}
        <div className="mt-12 flex flex-wrap justify-center gap-2.5">
          <FilterPill label="The whole sky" active={need === "all"} onClick={() => setNeed("all")} reduced={reduced} />
          {NEEDS.map((n) => (
            <FilterPill key={n} label={n} active={need === n} onClick={() => setNeed(n)} reduced={reduced} />
          ))}
        </div>

        {/* the constellation */}
        <div className="relative mt-10 h-[30rem] overflow-hidden rounded-2xl border border-gold-faint bg-gradient-to-b from-[#cfdae6] to-[#f0e7d0] sm:h-[34rem]">
          {/* faint star dust */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,hsl(var(--gold-bright)/0.05),transparent_70%)]" />

          <AnimatePresence mode="popLayout">
            {sky.map(({ w, x, y, big }) => {
              const isSel =
                selected?.name === w.name && selected?.need === w.need;
              return (
                <motion.button
                  key={`${w.name}-${w.need}`}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelected(isSel ? null : w)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={`Hear ${w.name}`}
                >
                  {/* the star */}
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      isSel
                        ? "h-3 w-3 bg-[hsl(var(--glory))] shadow-[0_0_26px_5px_hsl(var(--gold-bright)/0.65)]"
                        : big
                          ? "h-2 w-2 bg-[hsl(var(--glory)/0.9)] shadow-[0_0_12px_2px_hsl(var(--gold)/0.4)] group-hover:bg-[hsl(var(--gold))] group-hover:shadow-[0_0_20px_4px_hsl(var(--gold-bright)/0.55)]"
                          : "h-1.5 w-1.5 bg-[hsl(var(--glory)/0.6)] group-hover:bg-[hsl(var(--gold))] group-hover:shadow-[0_0_16px_3px_hsl(var(--gold-bright)/0.5)]"
                    }`}
                  />
                  {/* the name, rising on approach */}
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-serif-display text-[13px] italic transition-all duration-300 ${
                      isSel
                        ? "text-glory opacity-100"
                        : "text-parchment-dim opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {w.name}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* the drawn-down witness */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={`${selected.name}-${selected.need}`}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 z-10 border-t border-gold-soft bg-[#fbf6ea]/95 px-6 py-6 backdrop-blur-md sm:px-10"
              >
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                  <div className="shrink-0">
                    <p className="font-serif-display text-3xl font-light italic text-glory drop-shadow-[0_0_20px_hsl(var(--gold-bright)/0.5)]">
                      {selected.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                      {selected.ref}
                    </p>
                  </div>
                  <p className="font-serif-display flex-1 text-[15px] font-light italic leading-relaxed text-parchment sm:text-base">
                    "{selected.line}"
                  </p>
                  <div className="flex shrink-0 flex-col items-center gap-2.5 sm:items-end">
                    <Magnetic strength={0.25}>
                      <motion.a
                        href={PHONE_TEL}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 bg-[hsl(var(--gold-bright))] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0a0c14] transition-shadow duration-300 hover:shadow-[0_0_40px_-4px_hsl(var(--gold-bright)/0.7)]"
                      >
                        Call {selected.name.split(" ")[0]}
                      </motion.a>
                    </Magnetic>
                    {/* keep this star — gathered into the Inner Room */}
                    <button
                      onClick={() => toggleKept(selected.name)}
                      className={`inline-flex items-center gap-2 border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] transition-all duration-300 ${
                        kept.has(selected.name)
                          ? "border-[hsl(var(--gold-bright)/0.6)] bg-[hsl(var(--gold-bright)/0.12)] text-gold-bright"
                          : "border-gold-faint text-parchment-dim hover:border-gold-soft hover:text-parchment"
                      }`}
                    >
                      <Star
                        className="h-3 w-3"
                        strokeWidth={1.5}
                        fill={
                          kept.has(selected.name)
                            ? "hsl(var(--gold-bright))"
                            : "none"
                        }
                      />
                      {kept.has(selected.name) ? "In your sky" : "Keep this star"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-[13px] font-light text-parchment-dim">
          {WITNESSES.length} witnesses and more — the whole of Scripture leaning toward you.
          <br />
          <span className="font-serif-display italic text-parchment">
            One number. {PHONE_DISPLAY}. He sees the one you choose.
          </span>
        </p>
      </div>
    </section>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  reduced,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  reduced: boolean | null;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className={`rounded-full border px-4 py-2 text-[12px] font-light capitalize tracking-wide transition-all duration-400 ${
        active
          ? "border-[hsl(var(--gold-bright))] bg-[hsl(var(--gold-bright)/0.14)] text-parchment shadow-[0_0_30px_-6px_hsl(var(--gold-bright)/0.5)]"
          : "border-gold-faint bg-white/40 text-parchment-dim hover:border-gold-soft hover:text-parchment"
      }`}
    >
      {label}
    </motion.button>
  );
}
