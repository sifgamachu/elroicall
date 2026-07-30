import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneCall } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

type Need = {
  feeling: string;
  context: string;
  voice: string;
  theirStory: string;
  openingLine: string;
};

const NEEDS: Need[] = [
  {
    feeling: "I'm grieving",
    context: "someone is gone, and the silence is unbearable",
    voice: "Job",
    theirStory:
      "He lost his children, his health, his fortune — in a single day — and sat in the ashes refusing easy answers. He never got the 'why.' He got something better: presence.",
    openingLine:
      "Sit down. You don't have to explain it to me. I buried all ten of mine before sundown — I know what the silence sounds like after.",
  },
  {
    feeling: "I'm afraid",
    context: "of the decision, the diagnosis, the door I have to walk through",
    voice: "Esther",
    theirStory:
      "She faced a king uninvited, knowing it could mean death — 'and if I perish, I perish.' Her courage wasn't the absence of trembling. It was obedience while trembling.",
    openingLine:
      "My hands shook too, the morning I walked toward the throne. Tell me what you're afraid of — I'll tell you what I did with mine.",
  },
  {
    feeling: "I'm ashamed",
    context: "of what I did — and I can't undo it",
    voice: "Peter",
    theirStory:
      "He swore he'd die before he'd deny — then denied three times before sunrise, and wept bitterly. And the risen Christ's first question to him was not 'why?' but 'do you love me?'",
    openingLine:
      "I know the exact weight you're carrying. I heard a rooster crow and my whole life split in two. Tell me what happened. I'm not going anywhere.",
  },
  {
    feeling: "I'm burned out",
    context: "I've given everything and there's nothing left",
    voice: "Elijah",
    theirStory:
      "Fresh off his greatest victory, he collapsed under a broom tree and asked to die. Heaven's first response was not a sermon. It was bread, water, and sleep.",
    openingLine:
      "I won my greatest battle on a mountain — then ran into the desert and asked God to let me die. You are not weak. You are empty. There's a difference.",
  },
  {
    feeling: "I feel unqualified",
    context: "for the thing everyone is counting on me to do",
    voice: "Moses",
    theirStory:
      "A fugitive shepherd with a stammer, arguing with a burning bush: 'Please send someone else.' He went anyway — and the sea parted.",
    openingLine:
      "I argued with God Himself at that bush — 'please send someone else.' Forty years later, I still stammered. The calling was never about my résumé.",
  },
  {
    feeling: "My prayers feel unanswered",
    context: "I've asked for years, and heaven is quiet",
    voice: "Hannah",
    theirStory:
      "Year after year she went up to the house of the Lord and wept, praying so silently the priest thought she was drunk. She kept coming back. Heaven was not ignoring her — it was forming Samuel.",
    openingLine:
      "They watched me weep at the temple gate and thought I was drunk. I was just a woman who refused to stop asking. How long have you been asking?",
  },
  {
    feeling: "I failed — badly",
    context: "and I don't know the way back from this",
    voice: "Paul",
    theirStory:
      "He hunted the very people he would later die for — and called himself the worst of sinners. The road back began on a road, blinded, with a voice asking one question.",
    openingLine:
      "Before I wrote half the New Testament, I held the coats while good people were killed. Whatever you did — let's talk about who you become next.",
  },
  {
    feeling: "I'm starting over",
    context: "new city, new life, no map, nothing familiar",
    voice: "Ruth",
    theirStory:
      "A widow in a foreign land with nothing but loyalty — gleaning leftover grain to survive. Her 'random' field belonged to Boaz. Beginnings rarely announce themselves.",
    openingLine:
      "I followed Naomi to a country where I knew no one, and picked leftover grain to survive. Starting over looks small before it looks like destiny.",
  },
];

export default function Tonight() {
  const [active, setActive] = useState<Need>(NEEDS[0]);

  return (
    <section id="tonight" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow">Start here</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-serif-display mt-5 text-4xl font-light leading-[1.08] text-parchment sm:text-5xl">
              Whom do you need{" "}
              <span className="italic text-shimmer">tonight?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 text-[15px] font-light leading-relaxed text-parchment-dim">
              Say it simply, the way you'd say it out loud at 2am. There's a
              voice on this line who has lived exactly that.
            </p>
          </Reveal>
        </div>

        {/* emotion chips */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {NEEDS.map((n) => {
              const on = n.feeling === active.feeling;
              return (
                <button
                  key={n.feeling}
                  onClick={() => setActive(n)}
                  className={`border px-4 py-2.5 text-[12px] font-light tracking-wide transition-all duration-300 ${
                    on
                      ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.14)] text-gold-bright shadow-[0_0_30px_-8px_hsl(var(--gold)/0.4)]"
                      : "border-gold-faint text-parchment-dim hover:border-gold-soft hover:text-parchment"
                  }`}
                >
                  {n.feeling}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* matched voice card */}
        <div className="mx-auto mt-10 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.voice}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden border border-gold-soft bg-ink-2/70 backdrop-blur-sm"
            >
              <span className="absolute -top-px left-0 h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent" />
              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                {/* who answers */}
                <div className="relative border-b border-gold-faint p-9 sm:p-11 md:border-b-0 md:border-r">
                  <div className="breathe absolute right-8 top-8 h-24 w-24 rounded-full border border-[hsl(var(--gold)/0.25)]" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold">
                    You're feeling it — {active.context}
                  </p>
                  <p className="mt-8 text-[12px] font-light uppercase tracking-[0.25em] text-parchment-dim">
                    The line hands you to
                  </p>
                  <p className="font-serif-display mt-2 text-6xl font-light italic text-gold-bright">
                    {active.voice}
                  </p>
                  <p className="mt-7 text-[13.5px] font-light leading-relaxed text-parchment-dim">
                    {active.theirStory}
                  </p>
                </div>

                {/* what it sounds like */}
                <div className="flex flex-col justify-between p-9 sm:p-11">
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
                      <PhoneCall className="h-3.5 w-3.5" />
                      When the call connects
                    </p>
                    <p className="font-serif-display mt-6 text-xl font-light italic leading-[1.75] text-parchment sm:text-2xl">
                      "{active.openingLine}"
                    </p>
                  </div>
                  <div className="mt-9">
                    <motion.a
                      href={PHONE_TEL}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-block bg-[hsl(var(--gold))] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#1a1409] transition-shadow duration-300 hover:shadow-[0_0_45px_-8px_hsl(var(--gold)/0.55)]"
                    >
                      Talk to {active.voice} — first call free
                    </motion.a>
                    <p className="mt-3.5 text-[11.5px] font-light text-parchment-dim/80">
                      Call {PHONE_DISPLAY} · no account, no card · cancel anytime
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
