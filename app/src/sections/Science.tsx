import { Reveal, SectionHeading, GoldRule } from "@/components/reveal";
import { Brain, HeartHandshake, BookOpen } from "lucide-react";

const POINTS = [
  {
    icon: Brain,
    title: "Name it to calm it",
    body: "UCLA neuroimaging research found that putting feelings into words — affect labeling — measurably dampens the brain's alarm center, the amygdala, while engaging the prefrontal regions that regulate emotion. Saying your struggle out loud isn't venting. It's neurology.",
    source: "Lieberman et al., Psychological Science",
  },
  {
    icon: HeartHandshake,
    title: "Lived experience heals",
    body: "Support from someone who has walked through what you're walking through — peer support — is recommended across international mental-health guidance, with research linking it to gains in recovery, self-efficacy, and engagement. That principle is this product: Job for the grieving, Peter for the fallen.",
    source: "BMC Medicine, systematic umbrella review",
  },
  {
    icon: BookOpen,
    title: "Story carries meaning",
    body: "Humans make sense of suffering through narrative — placing our chapter inside a larger story. It's why every culture treasures its testimonies, and why Scripture is mostly stories, not systems. A voice that answers your story with theirs does what no pamphlet can.",
    source: "Narrative psychology tradition",
  },
];

export default function Science() {
  return (
    <section className="relative bg-ink-2/60">
      <GoldRule />
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Why it works"
          title={
            <>
              The science of{" "}
              <span className="italic text-gold-bright">being heard</span>
            </>
          }
          copy="The design of El Roi Call follows what both Scripture and clinical research say about how people move through suffering."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12} className="h-full">
              <article className="group flex h-full flex-col border border-gold-faint bg-ink p-9 transition-all duration-500 hover:border-gold-soft hover:shadow-[0_20px_60px_-30px_hsl(var(--gold)/0.25)]">
                <p.icon
                  className="h-6 w-6 text-gold transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1.25}
                />
                <h3 className="font-serif-display mt-6 text-2xl font-medium text-parchment">
                  {p.title}
                </h3>
                <p className="mt-4 flex-1 text-[13.5px] font-light leading-relaxed text-parchment-dim">
                  {p.body}
                </p>
                <p className="mt-6 border-t border-gold-faint pt-4 text-[10px] font-medium uppercase tracking-[0.24em] text-parchment-dim/70">
                  {p.source}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-[12.5px] font-light leading-relaxed text-parchment-dim/80">
            El Roi Call is a spiritual practice informed by this research — not
            therapy, and not a treatment for any condition. For clinical care,
            we'll always point you to licensed professionals.
          </p>
        </Reveal>
      </div>
      <GoldRule />
    </section>
  );
}
