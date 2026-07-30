import { Reveal, SectionHeading } from "@/components/reveal";

export const VOICES = [
  { name: "Job", tag: "for grief & loss" },
  { name: "Joseph", tag: "for betrayal" },
  { name: "Esther", tag: "for courage" },
  { name: "David", tag: "for guilt & giants" },
  { name: "Moses", tag: "for feeling unqualified" },
  { name: "Elijah", tag: "for burnout" },
  { name: "Ruth", tag: "for starting over" },
  { name: "Hannah", tag: "for unanswered prayer" },
  { name: "Paul", tag: "for a past you regret" },
  { name: "Abraham", tag: "for the unknown" },
  { name: "Naomi", tag: "for bitterness" },
  { name: "Gideon", tag: "for self-doubt" },
  { name: "Mary Magdalene", tag: "for shame" },
  { name: "Jonah", tag: "for running away" },
  { name: "Peter", tag: "for failure" },
];

function Marquee() {
  const row = [...VOICES, ...VOICES];
  return (
    <div className="relative overflow-hidden border-y border-gold-faint py-5">
      <div className="marquee-track flex w-max items-center gap-10">
        {row.map((v, i) => (
          <span
            key={i}
            className="flex items-center gap-10 whitespace-nowrap text-[13px] font-light tracking-wide text-parchment-dim"
          >
            <span>
              <span className="font-serif-display text-base italic text-gold-bright">
                {v.name}
              </span>{" "}
              {v.tag}
            </span>
            <span className="text-[hsl(var(--gold)/0.4)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Voices() {
  return (
    <section id="voices" className="relative">
      <Marquee />

      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Forty voices"
          title={
            <>
              Counsel from the ones{" "}
              <span className="italic text-gold-bright">who lived it</span>
            </>
          }
          copy="Not a chatbot with a Bible. Forty distinct voices, each anchored in their own story and Scripture — matched to yours."
        />

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-gold-faint bg-[hsl(var(--gold)/0.12)] sm:grid-cols-3 lg:grid-cols-5">
          {VOICES.map((v, i) => (
            <Reveal key={v.name} delay={(i % 5) * 0.06}>
              <div className="group relative flex h-full flex-col items-center justify-center gap-2 bg-ink px-4 py-10 text-center transition-colors duration-500 hover:bg-ink-3">
                <span className="absolute left-1/2 top-0 h-px w-0 -translate-x-1/2 bg-[hsl(var(--gold))] transition-all duration-500 group-hover:w-2/3" />
                <span className="font-serif-display text-2xl font-medium text-parchment transition-colors group-hover:text-gold-bright">
                  {v.name}
                </span>
                <span className="text-[11px] font-light tracking-[0.14em] text-parchment-dim">
                  {v.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
