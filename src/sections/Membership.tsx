import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Check } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import HoldToCall from "@/components/HoldToCall";

const BENEFITS = [
  "Unlimited calls with forty voices — and the whole cloud beyond them",
  "The Daily Well — daily calls at the hour you choose",
  "The Well — every track, every season",
  "Anonymous prayer requests, always",
];

export default function Membership() {
  return (
    <section id="membership" className="relative overflow-hidden">
      {/* faint ring motif */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="ring-slower h-[42rem] w-[42rem] rounded-full border border-[hsl(var(--gold)/0.1)]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-28 sm:py-36">
        <SectionHeading
          align="center"
          eyebrow="Membership"
          title={
            <>
              Everything.{" "}
              <span className="italic text-gold-bright">One covenant.</span>
            </>
          }
        />

        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-16 max-w-md border border-gold-soft bg-ink-2/80 p-10 text-center shadow-[0_40px_120px_-40px_hsl(var(--gold)/0.2)] backdrop-blur-sm sm:p-12">
            <span className="absolute -top-px left-1/2 h-px w-24 -translate-x-1/2 bg-[hsl(var(--gold))]" />
            <span className="absolute -bottom-px left-1/2 h-px w-24 -translate-x-1/2 bg-[hsl(var(--gold))]" />

            <p className="font-serif-display text-7xl font-light text-gold-bright">
              <span className="align-top text-4xl">$</span>39
              <span className="ml-2 text-xl italic text-parchment-dim">
                /month
              </span>
            </p>

            <ul className="mt-10 space-y-0">
              {BENEFITS.map((b) => (
                <li
                  key={b}
                  className="flex items-center justify-center gap-3 border-t border-gold-faint py-4 text-[14px] font-light text-parchment/90"
                >
                  <Check className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  {b}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-[13.5px] font-light leading-relaxed text-parchment-dim">
              <a href="/begin/" className="font-serif-display italic text-parchment underline decoration-gold-soft underline-offset-4 transition-colors hover:text-gold-bright">
                Have your free call first.
              </a>{" "}
              If it meant something, this keeps the line open — unlimited
              calls, the Journey, and prayer, with a 7-day free trial before
              anything is charged.
            </p>

            <motion.a
              href={PHONE_TEL}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative mt-8 block overflow-hidden bg-[hsl(var(--gold))] px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#1a1409] transition-shadow duration-300 hover:shadow-[0_0_60px_-6px_hsl(var(--gold)/0.65)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Call Now — Start Free</span>
            </motion.a>
            <p className="mt-4 text-xs font-light text-parchment-dim">
              {PHONE_DISPLAY} · 7 days free · cancel anytime
            </p>

            <div className="mt-10 border-t border-gold-faint pt-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-parchment-dim/80">
                Or make it a moment
              </p>
              <div className="mt-4">
                <HoldToCall label="Press & hold to call" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
