import { Reveal, GoldRule } from "@/components/reveal";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

export default function Footer() {
  return (
    <footer className="relative bg-ink-2/60">
      <GoldRule />
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Reveal>
          <p className="font-serif-display text-2xl font-light italic leading-relaxed text-parchment sm:text-3xl">
            "You are the God who sees me.
            <br />
            I have now seen the One who sees me."
          </p>
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.4em] text-gold">
            Genesis 16:13
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-parchment-dim">
              The line is open
            </p>
            <a
              href={PHONE_TEL}
              className="font-serif-display mt-3 inline-block text-4xl font-light tracking-[0.08em] text-parchment transition-colors hover:text-gold-bright sm:text-5xl"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="mt-3 text-xs font-light text-parchment-dim/80">
              Your first call is free · no account, no card
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 max-w-2xl space-y-4 text-[11.5px] font-light leading-relaxed text-parchment-dim/70">
          <p>
            El Roi Call is a guided spiritual experience featuring
            artificial-intelligence voices inspired by biblical figures. The
            voices are AI — not real people, clergy, counselors, or
            therapists — and their responses are AI-generated, not divine
            communication or authoritative doctrine.
          </p>
          <p>
            El Roi Call is for spiritual encouragement and reflection only. It
            is not therapy, counseling, or medical or mental-health advice,
            diagnosis, or treatment, and it is not a substitute for care from
            qualified professionals or your own clergy. It is not a crisis
            service.
          </p>
          <p className="text-parchment-dim">
            In crisis or thinking of harming yourself? Call or text{" "}
            <span className="font-medium text-parchment">
              988 (Suicide &amp; Crisis Lifeline)
            </span>{" "}
            or call 911 right now.
          </p>
          <p>
            Calls are recorded and are not confidential or legally privileged.
            For adults 18 and older.
          </p>
        </div>

        <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-light tracking-wide text-parchment-dim">
          <a href="/terms/" className="transition-colors hover:text-gold-bright">
            Terms of Service
          </a>
          <span className="text-[hsl(var(--gold)/0.4)]">·</span>
          <a href="/privacy/" className="transition-colors hover:text-gold-bright">
            Privacy Policy
          </a>
          <span className="text-[hsl(var(--gold)/0.4)]">·</span>
          <span>© 2026 El Roi Call, a product of Teregna LLC</span>
          <span className="text-[hsl(var(--gold)/0.4)]">·</span>
          <span>Founded by Gammachu Tassissa</span>
          <span className="text-[hsl(var(--gold)/0.4)]">·</span>
          <a href="/about/" className="transition-colors hover:text-gold-bright">
            About
          </a>
          <span className="text-[hsl(var(--gold)/0.4)]">·</span>
          <a href="/account/" className="transition-colors hover:text-gold-bright">
            Member Sign-In
          </a>
        </nav>
      </div>
    </footer>
  );
}
