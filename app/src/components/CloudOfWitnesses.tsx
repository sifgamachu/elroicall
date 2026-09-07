import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import { WITNESSES, NEEDS, type Witness, type Need } from "@/lib/witnesses";

const NEED_LABEL: Record<Need, string> = {
  grief: "Grief & loss",
  fear: "Fear & anxiety",
  shame: "Shame & failure",
  burnout: "Exhaustion",
  unanswered: "Waiting & unanswered prayer",
  unqualified: "Feeling unqualified",
  "starting over": "Starting over",
  unseen: "Feeling unseen",
  calling: "Direction & calling",
};

function readSavedStories() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(localStorage.getItem("elroi-kept-stars") ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [] as string[];
  }
}

export default function CloudOfWitnesses() {
  const reduced = useReducedMotion();
  const [need, setNeed] = useState<Need | "all">("all");
  const [selected, setSelected] = useState<Witness | null>(null);
  const [keptNames, setKeptNames] = useState<string[]>(readSavedStories);

  const kept = useMemo(() => new Set(keptNames), [keptNames]);

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

  const visible = useMemo(() => {
    if (need === "all") return WITNESSES.slice(0, 12);
    return WITNESSES.filter((w) => w.need === need);
  }, [need]);

  const activeSelected =
    selected && (need === "all" || selected.need === need) ? selected : null;

  return (
    <section id="witnesses" className="relative overflow-hidden border-y border-gold-faint bg-[#e9e2d3] text-[#17130d]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_0%,rgba(201,168,76,0.24),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full border border-[#b69a54]/20" />
      <div className="pointer-events-none absolute -right-4 top-44 h-40 w-40 rounded-full border border-[#b69a54]/25" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8d6e27]">Hebrews 12:1 · The Cloud of Witnesses</p>
            <h2 className="font-serif-display mt-5 text-4xl font-light leading-[1.08] tracking-tight text-[#1b1710] sm:text-6xl">
              You are not the first person
              <span className="block italic text-[#8d6e27]">to stand on this ground.</span>
            </h2>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-[15px] font-light leading-[1.85] text-[#5f584b]">
              Scripture is full of people who grieved, failed, waited, hid, doubted, started over, and still found God in the middle of it. Choose what you are carrying and meet the stories that may help you reflect.
            </p>
            <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#776d5d]">
              El Roi Call uses AI-generated companions inspired by these stories. They are not the actual biblical people.
            </p>
          </div>
        </div>

        <div className="mt-12 flex gap-2 overflow-x-auto pb-3 sm:flex-wrap sm:overflow-visible">
          <FilterPill label="Start anywhere" active={need === "all"} onClick={() => setNeed("all")} reduced={reduced} />
          {NEEDS.map((n) => (
            <FilterPill key={n} label={NEED_LABEL[n]} active={need === n} onClick={() => setNeed(n)} reduced={reduced} />
          ))}
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((w, i) => {
            const isSelected = activeSelected?.name === w.name && activeSelected?.need === w.need;
            return (
              <motion.button
                key={`${w.name}-${w.need}`}
                type="button"
                onClick={() => setSelected(isSelected ? null : w)}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.035, 0.25) }}
                className={`group relative min-h-44 border p-6 text-left transition-all duration-300 ${
                  isSelected
                    ? "border-[#9d7b31] bg-[#fffaf0] shadow-[0_22px_70px_-42px_rgba(73,50,13,.55)]"
                    : "border-[#c9b98f]/55 bg-[#f4ecdc]/70 hover:-translate-y-0.5 hover:border-[#a98b49] hover:bg-[#fbf4e7]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8d6e27]">{NEED_LABEL[w.need as Need]}</p>
                    <h3 className="font-serif-display mt-2 text-3xl font-medium text-[#1d1810]">{w.name}</h3>
                  </div>
                  <BookOpen className="h-4 w-4 shrink-0 text-[#9f8141]" strokeWidth={1.4} />
                </div>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#7c7160]">{w.ref}</p>
                <p className="font-serif-display mt-4 line-clamp-3 text-[17px] font-light italic leading-[1.55] text-[#51483a]">“{w.line}”</p>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8d6e27] opacity-70 transition-opacity group-hover:opacity-100">
                  {isSelected ? "Close story" : "Open this story"}
                </p>
              </motion.button>
            );
          })}
        </div>

        {need === "all" && (
          <p className="mt-5 text-center text-[11px] font-light text-[#756b5c]">
            Showing a few starting points. Choose a feeling above to see the stories connected to it.
          </p>
        )}

        <AnimatePresence mode="wait">
          {activeSelected && (
            <motion.div
              key={`${activeSelected.name}-${activeSelected.need}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.45 }}
              className="mt-8 border border-[#ad9255]/55 bg-[#fffaf0] p-7 shadow-[0_28px_90px_-55px_rgba(72,47,8,.7)] sm:p-9"
            >
              <div className="grid gap-7 md:grid-cols-[0.78fr_1.22fr] md:items-center">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8d6e27]">A story to sit with</p>
                  <h3 className="font-serif-display mt-3 text-5xl font-light italic text-[#2b2113]">{activeSelected.name}</h3>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#7f7463]">{activeSelected.ref}</p>
                  <button
                    type="button"
                    onClick={() => toggleKept(activeSelected.name)}
                    className={`mt-6 inline-flex items-center gap-2 border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                      kept.has(activeSelected.name)
                        ? "border-[#8d6e27] bg-[#efe1bc] text-[#5f481b]"
                        : "border-[#c8b98f] text-[#746342] hover:border-[#8d6e27]"
                    }`}
                  >
                    <Star className="h-3 w-3" fill={kept.has(activeSelected.name) ? "currentColor" : "none"} />
                    {kept.has(activeSelected.name) ? "Saved on this device" : "Save this story"}
                  </button>
                </div>

                <div>
                  <p className="font-serif-display text-2xl font-light italic leading-[1.7] text-[#403526] sm:text-[1.7rem]">“{activeSelected.line}”</p>
                  <p className="mt-5 text-[12px] font-light leading-[1.75] text-[#716656]">
                    The guided call is an AI-generated spiritual reflection inspired by {activeSelected.name}'s biblical story. It should point you back toward Scripture and real community, not replace them.
                  </p>
                  <a
                    href={`/begin/?need=${encodeURIComponent(activeSelected.need)}`}
                    className="group mt-7 inline-flex items-center gap-3 bg-[#9d7b31] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fffaf0] transition-all hover:bg-[#826322]"
                  >
                    Start with this kind of story
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      type="button"
      onClick={onClick}
      whileHover={reduced ? undefined : { y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      className={`shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-medium tracking-wide transition-all ${
        active
          ? "border-[#8d6e27] bg-[#8d6e27] text-[#fffaf0]"
          : "border-[#bba875]/70 bg-[#f6eedf]/60 text-[#685b47] hover:border-[#8d6e27] hover:bg-[#fff8eb]"
      }`}
    >
      {label}
    </motion.button>
  );
}
