import { Reveal, GoldRule } from "@/components/reveal";
import { Gift as GiftIcon } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

export default function Gift() {
  return (
    <section className="relative">
      <GoldRule />
      <div className="mx-auto max-w-3xl px-6 py-28 text-center sm:py-32">
        <Reveal>
          <p className="eyebrow">Give it away</p>
        </Reveal>
        <Reveal delay={0.1}>
          <GiftIcon
            className="mx-auto mt-8 h-7 w-7 text-gold"
            strokeWidth={1.25}
          />
        </Reveal>
        <Reveal delay={0.15}>
          <h2 className="font-serif-display mt-6 text-4xl font-light leading-tight text-parchment sm:text-5xl">
            Someone you love is{" "}
            <span className="italic text-gold-bright">
              carrying something heavy
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-[15px] font-light leading-relaxed text-parchment-dim">
            You can't always find the words for a grieving friend, a
            frightened sibling, a child who's ashamed. So give them a voice
            who lived it.{" "}
            <em className="font-serif-display text-parchment">Gift a Call</em>{" "}
            — one free conversation, sent with your name on it. No cost to
            them, no catch.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <a
            href="/gift/"
            className="mt-10 inline-block border border-gold-soft px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-gold-bright transition-all duration-300 hover:bg-[hsl(var(--gold))] hover:text-[#1a1409]"
          >
            Gift a Call
          </a>
          <p className="mt-4 text-xs font-light text-parchment-dim">
            Free to send · they call{" "}
            <a href={PHONE_TEL} className="text-parchment underline decoration-gold-soft underline-offset-4 transition-colors hover:text-gold-bright">
              {PHONE_DISPLAY}
            </a>{" "}
            whenever they're ready
          </p>
        </Reveal>
      </div>
      <GoldRule />
    </section>
  );
}
