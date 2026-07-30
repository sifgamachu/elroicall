import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { PHONE_TEL } from "@/lib/phone";

const ACTS = [
  {
    numeral: "I",
    title: "You call",
    body: "No menus, no apps in the moment. A gentle operator answers, listens, and asks only what's needed. You are heard before anything else happens.",
  },
  {
    numeral: "II",
    title: "You're matched",
    body: "Grieving? You're put through to Job. Afraid to act? Esther. Ashamed of a failure? Peter. The match is to lived experience, not a menu option.",
  },
  {
    numeral: "III",
    title: "You talk with someone who lived it",
    body: "Counsel from scars, anchored in Scripture, ending in prayer. Call back anytime — your story is remembered, so you never start over.",
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
              One number.{" "}
              <span className="italic text-gold-bright">Three acts.</span>
            </>
          }
        />

        <div className="mt-20 grid items-start gap-14 lg:grid-cols-[1fr_0.85fr]">
          {/* acts */}
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

          {/* image */}
          <Reveal delay={0.2} className="lg:sticky lg:top-28">
            <div ref={imgWrapRef} className="group relative overflow-hidden border border-gold-faint">
              <motion.img
                src="/images/telephone.jpg"
                alt="An antique telephone handset resting on parchment by candlelight"
                style={{ y: parallaxY, transitionDuration: "2500ms" }}
                className="aspect-[16/10] w-full scale-[1.18] object-cover transition-transform ease-out group-hover:scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a07]/80 via-transparent to-transparent" />
              <p className="font-serif-display absolute bottom-5 left-6 right-6 text-lg italic text-[#f5ecda]">
                "Before they call, I will answer; while they are still
                speaking, I will hear."
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="mt-20 text-center">
          <a
            href={PHONE_TEL}
            className="inline-block border border-gold-soft px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-gold-bright transition-all duration-300 hover:bg-[hsl(var(--gold))] hover:text-[#1a1409]"
          >
            Start With a Free Call
          </a>
          <p className="mt-4 text-xs font-light text-parchment-dim">
            7 days free · cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  );
}
