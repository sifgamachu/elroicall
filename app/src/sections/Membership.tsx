import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Check, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

const BENEFITS = [
  "Unlimited guided calls across the Cloud of Witnesses",
  "The Daily Well — scheduled calls at the hour you choose",
  "The Journey, Pulpit Walk, Daily Check-In, and Surprise Me",
  "Your Bible progress, saved journeys, and call history",
];

export default function Membership() {
  return (
    <section id="membership" className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="ring-slower h-[42rem] w-[42rem] rounded-full border border-[hsl(var(--gold)/0.1)]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-28 sm:py-36">
        <SectionHeading
          align="center"
          eyebrow="After the first call"
          title={
            <>
              If it helps, <span className="italic text-gold-bright">keep the line open.</span>
            </>
          }
          copy="Your first guided call is free with no card. Membership is optional — it turns El Roi Call from a single moment into a recurring spiritual rhythm."
        />

        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-16 max-w-lg border border-gold-soft bg-ink-2/80 p-9 shadow-[0_40px_120px_-40px_hsl(var(--gold)/0.2)] backdrop-blur-sm sm:p-12">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">Optional membership</p>
              <p className="font-serif-display mt-4 text-7xl font-light text-gold-bright">
                <span className="align-top text-4xl">$</span>39
                <span className="ml-2 text-xl italic text-parchment-dim">/month</span>
              </p>
              <p className="mt-3 text-[12px] font-light text-parchment-dim">7-day membership trial before the first membership charge</p>
            </div>

            <ul className="mt-9">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 border-t border-gold-faint py-4 text-[14px] font-light leading-relaxed text-parchment/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-none border border-gold-faint bg-black/15 p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold">The simple path</p>
              <div className="mt-4 grid gap-3 text-[13px] font-light text-parchment-dim sm:grid-cols-3">
                <div><strong className="block font-serif-display text-lg font-medium text-parchment">1</strong>Free first call<br />No card</div>
                <div><strong className="block font-serif-display text-lg font-medium text-parchment">2</strong>Choose membership<br />only if you want it</div>
                <div><strong className="block font-serif-display text-lg font-medium text-parchment">3</strong>7-day trial<br />then $39/month</div>
              </div>
            </div>

            <motion.a
              href="/begin/"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative mt-8 block overflow-hidden bg-[hsl(var(--gold))] px-8 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.25em] text-[#1a1409] transition-shadow duration-300 hover:shadow-[0_0_60px_-8px_hsl(var(--gold)/0.65)]"
            >
              Start with the free call
            </motion.a>

            <a
              href={PHONE_TEL}
              className="mt-5 flex items-center justify-center gap-2 text-[12px] font-light text-parchment-dim transition-colors hover:text-gold-bright"
            >
              <Phone className="h-3.5 w-3.5" />
              Prefer to dial now? {PHONE_DISPLAY}
            </a>

            <p className="mt-7 text-center text-[11px] font-light leading-relaxed text-parchment-dim/80">
              Membership terms, billing timing, and cancellation details are shown before subscription. The free first call is separate from the membership trial.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
