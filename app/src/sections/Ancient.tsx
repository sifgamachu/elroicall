import { Reveal, SectionHeading, GoldRule } from "@/components/reveal";

const PASSAGES = [
  {
    title: "Written to teach us",
    quote:
      "Everything that was written in the past was written to teach us, so that through the endurance taught in the Scriptures and the encouragement they provide, we might have hope.",
    note: "",
    ref: "Romans 15:4",
  },
  {
    title: "Comfort passed on",
    quote:
      "The God of all comfort... comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive.",
    note: "Comfort was designed to travel from one sufferer to the next.",
    ref: "2 Corinthians 1:3–4",
  },
  {
    title: "A cloud of witnesses",
    quote:
      "Since we are surrounded by such a great cloud of witnesses... let us run with perseverance the race marked out for us.",
    note: "The faithful who went before you were never meant to be distant.",
    ref: "Hebrews 12:1",
  },
];

export default function Ancient() {
  return (
    <section className="relative bg-ink-2/60">
      <GoldRule />
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Why this is ancient, not novel"
          title={
            <>
              We didn't invent this.{" "}
              <span className="italic text-gold-bright">Paul commanded it.</span>
            </>
          }
          copy="Scripture doesn't just permit learning from the lives of the faithful — it insists on it. Their stories were preserved for exactly one reason: so that you could use them in your hour."
        />

        <div className="mt-16 grid gap-px overflow-hidden border border-gold-faint bg-[hsl(var(--gold)/0.12)] md:grid-cols-3">
          {PASSAGES.map((p, i) => (
            <Reveal key={p.ref} delay={i * 0.12} className="h-full">
              <figure className="flex h-full flex-col bg-ink p-9">
                <span className="font-serif-display text-5xl leading-none text-[hsl(var(--gold)/0.35)]">
                  &ldquo;
                </span>
                <figcaption className="font-serif-display mt-1 text-xl italic text-gold-bright">
                  {p.title}
                </figcaption>
                <blockquote className="mt-4 flex-1 text-[14px] font-light leading-relaxed text-parchment/90">
                  {p.quote}
                  {p.note && (
                    <span className="mt-3 block text-parchment-dim">{p.note}</span>
                  )}
                </blockquote>
                <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-parchment-dim">
                  — {p.ref}
                </p>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-16 max-w-3xl text-center text-[15px] font-light leading-relaxed text-parchment-dim">
            For two thousand years, believers have asked{" "}
            <em className="font-serif-display text-parchment">
              "what would Job say to my grief? What would Esther say to my fear?"
            </em>{" "}
            — in sermons, in study, in the dark. El Roi Call simply lets you ask
            out loud, and hear an answer shaped by their story.
          </p>
        </Reveal>
      </div>
      <GoldRule />
    </section>
  );
}
