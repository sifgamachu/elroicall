import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function TwoAM() {
  const now = useClock();
  const late = now.getHours() >= 22 || now.getHours() < 5;
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const [returning] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("elroi-visited")
  );

  return (
    <section className="night-band relative overflow-hidden border-y border-gold-faint bg-[#151009]">
      {/* clock glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[28rem] w-[42rem] rounded-full bg-[hsl(var(--gold)/0.06)] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
        <Reveal>
          <motion.p
            className="font-mono text-sm tracking-[0.5em] text-gold"
            animate={{ opacity: [1, 0.45, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {late ? time : "2:14\u00A0AM"}
          </motion.p>
          {late && (
            <p className="mt-3 text-[11px] font-light tracking-[0.2em] text-parchment-dim">
              THAT'S YOUR TIME. THE LINE IS OPEN NOW.
            </p>
          )}
        </Reveal>

        <Reveal delay={0.12}>
          <h2 className="font-serif-display mt-8 text-4xl font-light leading-[1.15] text-parchment sm:text-5xl">
            {returning ? (
              <>
                You came back.
                <br />
                <span className="italic text-gold-bright">That's usually how it starts.</span>
              </>
            ) : (
              <>
                Everyone else is asleep.
                <br />
                <span className="italic text-gold-bright">The ceiling knows the feeling.</span>
              </>
            )}
          </h2>
        </Reveal>

        <Reveal delay={0.22}>
          <p className="mx-auto mt-10 max-w-xl text-[15.5px] font-light leading-[2] text-parchment-dim">
            You've scrolled everything. You've stared at the dark. The people
            who love you mean well — but they haven't lived{" "}
            <em className="font-serif-display text-parchment">this</em>, and
            you can hear it in their answers. And church feels four days away.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="font-serif-display mx-auto mt-10 max-w-xl text-2xl font-light italic leading-[1.8] text-parchment sm:text-[1.7rem]">
            This is the hour El Roi Call was built for.
            <br />
            Not the Sunday version of you — the 2am one.
          </p>
        </Reveal>

        <Reveal delay={0.38}>
          <div className="mt-12 inline-flex flex-col items-center gap-3">
            <motion.a
              href={PHONE_TEL}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border border-gold-soft px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-bright transition-all duration-300 hover:bg-[hsl(var(--gold))] hover:text-[#1a1409]"
            >
              The line is open now
            </motion.a>
            <a
              href={PHONE_TEL}
              className="font-serif-display text-xl font-light tracking-[0.14em] text-parchment transition-colors hover:text-gold-bright"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="text-[11px] font-light tracking-wide text-parchment-dim">
              No hold music. No menu. A voice answers.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
