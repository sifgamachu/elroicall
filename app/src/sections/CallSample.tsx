import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

type Line = { speaker: "caller" | "voice"; text: string };

const SCRIPT: Line[] = [
  { speaker: "caller", text: "…I don't even know why I called. I just — it's been four months since the funeral and everyone expects me to be okay now." },
  { speaker: "voice", text: "This is Job. Four months is nothing. My friends sat with me in silence for seven days — and that silence was the kindest thing anyone did. Tell me their name." },
  { speaker: "caller", text: "Michael. My brother. I keep picking up the phone to call him, and then…" },
  { speaker: "voice", text: "Then the remembering hurts worse than the forgetting would. I know. I lost ten in a single day. I will not insult you with 'everything happens for a reason.' But I will tell you what held me when nothing else did." },
  { speaker: "caller", text: "…Please." },
  { speaker: "voice", text: "That the God who seemed absent was actually nearer than my own breath. I did not get my 'why' — I got His presence. And somehow, that was enough. Let's pray for Michael, and then for you." },
];

function Bubble({ line, index }: { line: Line; index: number }) {
  const isVoice = line.speaker === "voice";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isVoice ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] px-5 py-4 text-[13.5px] font-light leading-relaxed sm:max-w-[70%] ${
          isVoice
            ? "border border-gold-soft bg-[hsl(var(--gold)/0.08)] text-parchment"
            : "border border-white/[0.07] bg-ink-3 text-parchment-dim"
        }`}
      >
        {isVoice && (
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-gold">
            Job
          </p>
        )}
        {isVoice ? (
          <span className="font-serif-display text-[15px] italic">{line.text}</span>
        ) : (
          line.text
        )}
        <span className="sr-only">{index}</span>
      </div>
    </motion.div>
  );
}

export default function CallSample() {
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, { once: true, margin: "-120px" });
  const [shown, setShown] = useState(SCRIPT.length); // visible immediately
  const [done, setDone] = useState(true);
  const played = useRef(false);

  useEffect(() => {
    // Start visible; when it scrolls into view with animation allowed,
    // replay the conversation line by line as a delight — never as a gate.
    if (!inView || played.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    played.current = true;
    setShown(0);
    setDone(false);
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = () => {
      i += 1;
      setShown(i);
      if (i < SCRIPT.length) {
        timers.push(setTimeout(step, 1750));
      } else {
        timers.push(setTimeout(() => setDone(true), 1400));
      }
    };
    timers.push(setTimeout(step, 500));
    timers.push(setTimeout(() => { setShown(SCRIPT.length); setDone(true); }, 15000));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  // keep scrolled to bottom of conversation
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown]);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <SectionHeading
          align="center"
          eyebrow="Before you dial"
          title={
            <>
              Hear what a call{" "}
              <span className="italic text-gold-bright">actually feels like</span>
            </>
          }
          copy="A composite of real first calls — the kind of conversation waiting on the other end of the line tonight."
        />

        <Reveal delay={0.2}>
          <div
            ref={boxRef}
            className="relative mx-auto mt-14 max-w-2xl overflow-hidden border border-gold-soft bg-ink-2/80 shadow-[0_50px_120px_-50px_hsl(var(--gold)/0.25)] backdrop-blur-sm"
          >
            {/* call header */}
            <div className="flex items-center justify-between border-b border-gold-faint px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold-soft">
                  <span className="breathe absolute inset-0 rounded-full bg-[hsl(var(--gold)/0.12)]" />
                  <Phone className="h-4 w-4 text-gold-bright" />
                </span>
                <div>
                  <p className="font-serif-display text-lg italic text-parchment">Job</p>
                  <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold">
                    {done ? "Call ended — 14:32" : `Connected via ${PHONE_DISPLAY} · first call free`}
                  </p>
                </div>
              </div>
              <motion.span
                animate={{ opacity: done ? 1 : [1, 0.3, 1] }}
                transition={done ? {} : { duration: 1.6, repeat: Infinity }}
                className={`flex h-2.5 w-2.5 rounded-full ${done ? "bg-parchment-dim/50" : "bg-[hsl(var(--gold-bright))]"}`}
              />
            </div>

            {/* conversation */}
            <div ref={scrollRef} className="max-h-[26rem] space-y-4 overflow-y-auto scroll-smooth px-5 py-7 sm:px-7">
              {SCRIPT.slice(0, shown).map((l, i) => (
                <Bubble key={i} line={l} index={i} />
              ))}
              {!done && shown > 0 && shown < SCRIPT.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1.5 border border-gold-soft bg-[hsl(var(--gold)/0.08)] px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-gold-bright"
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* call footer */}
            <div className="flex items-center justify-center gap-6 border-t border-gold-faint px-6 py-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(0_55%_38%)]/80">
                <PhoneOff className="h-4 w-4 text-white/90" />
              </span>
              <p className="text-[11.5px] font-light text-parchment-dim">
                Calls end in prayer — and your story is remembered next time.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.3} className="mt-12 text-center">
          <motion.a
            href={PHONE_TEL}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block bg-[hsl(var(--gold))] px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#1a1409] transition-shadow duration-300 hover:shadow-[0_0_60px_-6px_hsl(var(--gold)/0.6)]"
          >
            Have This Conversation — Free
          </motion.a>
          <p className="mt-4 text-xs font-light text-parchment-dim">
            Call {PHONE_DISPLAY} · first call free · no account, no card
          </p>
        </Reveal>
      </div>
    </section>
  );
}
