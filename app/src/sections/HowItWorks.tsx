import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";

const ACTS = [
  {
    numeral: "I",
    title: "You talk. The guide listens.",
    body: "Start with what is actually happening — grief, fear, exhaustion, regret, waiting, loneliness, or something that does not fit a label. The first job of El Roi Guide is to understand before it explains.",
  },
  {
    numeral: "II",
    title: "A story opens.",
    body: "When a biblical story fits, the same guide brings it into the conversation: Job's grief, Hagar's desert, Esther's fear, Peter's failure, Ruth's beginning again. The guide narrates; it never pretends to be the biblical person.",
  },
  {
    numeral: "III",
    title: "The conversation comes back to you.",
    body: "The guide connects the story to Scripture, asks one useful question at a time, and can pray with you when you want. One familiar AI voice stays consistent while the biblical story changes with the moment.",
  },
];

export default function HowItWorks() {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imgWrapRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="how" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              One guide. Many stories.{" "}
              <span className="italic text-gold-bright">Your life stays at the center.</span>
            </>
          }
          copy="No operator theater. No cast of AI characters. One recognizable guide listens and uses Scripture to help you reflect."
        />

        <div className="mt-20 grid items-start gap-14 lg:grid-cols-[1fr_0.85fr]">
          <ol className="relative space-y-14 border-l border-gold-faint pl-10">
            {ACTS.map((a, i) => (
              <Reveal key={a.numeral} delay={i * 0.15}>
                <li className="relative">
                  <span className="absolute -left-[3.35rem] flex h-10 w-10 items-center justify-center rounded-full border border-gold-soft bg-ink font-serif-display text-lg italic text-gold-bright">
                    {a.numeral}
                  </span>
                  <h3 className="font-serif-display text-3xl font-medium text-parchment">
                    {a.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[14px] font-light leading-relaxed text-parchment-dim">
                    {a.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.2} className="lg:sticky lg:top-28">
            <div ref={imgWrapRef} className="group relative overflow-hidden border border-gold-faint">
              <motion.img
                src="/images/telephone.jpg"
                alt="An antique telephone handset resting on parchment by candlelight"
                style={{ y: parallaxY, transitionDuration: "2500ms" }}
                className="aspect-[16/10] w-full scale-[1.18] object-cover transition-transform ease-out group-hover:scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a07]/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-6 right-6">
                <p className="font-serif-display text-lg italic text-[#f5ecda]">
                  “Before they call, I will answer; while they are still speaking, I will hear.”
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-[#d7c59c]">Isaiah 65:24</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="mt-20 text-center">
          <a
            href="/begin/"
            className="inline-block bg-[hsl(var(--gold))] px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#1a1409] transition-all duration-300 hover:bg-[hsl(var(--gold-bright))]"
          >
            Meet El Roi Guide
          </a>
          <p className="mt-4 text-xs font-light text-parchment-dim">
            First call free · no card · one AI guide voice across every story
          </p>
        </Reveal>
      </div>
    </section>
  );
}
