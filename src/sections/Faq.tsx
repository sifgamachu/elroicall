import { SectionHeading, Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Isn't this a gimmick?",
    a: "No — and we will never pretend otherwise. The voices are AI, carefully crafted from each figure's story and Scripture, within a guided spiritual experience. Ask any voice directly and it will tell you the truth. What's real is what happens in you: being heard, being pointed back to the Word, and prayer.",
  },
  {
    q: "Am I talking to a real person?",
    a: "Never. El Roi Call is for the Tuesday-at-2am moments between Sundays — a companion to your faith life, not a substitute for your church, your people, or your own prayer. We will always point you back toward real community.",
  },
  {
    q: "Is this meant to replace church, my pastor, or prayer?",
    a: "Never. El Roi Call is for the Tuesday-at-2am moments between Sundays — a companion to your faith life, not a substitute for your church, your people, or your own prayer. We will always point you back toward real community.",
  },
  {
    q: "Is what I share private?",
    a: "Yes. Your conversations are used only to serve you better on your next call. Prayer requests are stored with no name and no number, and are permanently destroyed after 72 hours — enforced automatically, not by policy but by the database itself.",
  },
  {
    q: "What tradition is this rooted in?",
    a: "The Bible itself. Every voice speaks from their own scriptural story — no denominational add-ons, no doctrine beyond the text. Christians of every background call the same number.",
  },
  {
    q: "What does it cost, and can I cancel?",
    a: "One membership: $39 a month, everything included — unlimited calls, the Journey, every track in the Well. Your first week is free, and you can cancel anytime in one step. No tiers, no upsells.",
  },
];

export default function Faq() {
  return (
    <section id="questions" className="relative bg-ink-2/60">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeading
          align="center"
          eyebrow="Honest answers"
          title={
            <>
              What you're{" "}
              <span className="italic text-gold-bright">probably wondering</span>
            </>
          }
        />

        <Reveal delay={0.15}>
          <Accordion type="single" collapsible className="mt-14">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-gold-faint"
              >
                <AccordionTrigger className="py-6 text-left font-serif-display text-xl font-medium text-parchment hover:text-gold-bright hover:no-underline [&>svg]:text-gold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-7 text-[14px] font-light leading-relaxed text-parchment-dim">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
