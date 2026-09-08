import { SectionHeading, Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Who am I actually talking to?",
    a: "El Roi is an AI-guided biblical reflection experience. The AI can listen, reflect what it heard, open Scripture, ask questions, and pray with you if you want. Job, Hagar, Esther, Peter, Ruth, and other biblical people are stories from Scripture—not synthetic people pretending to be on the line.",
  },
  {
    q: "Why doesn't El Roi pretend to be a Bible character?",
    a: "Because trust matters more than immersion. The purpose is to help you enter the biblical story with honesty and context, not to manufacture a conversation with someone who lived thousands of years ago. Scripture should become clearer, not more theatrical.",
  },
  {
    q: "Does El Roi speak for God?",
    a: "No. El Roi does not claim divine revelation, private knowledge from God, or guaranteed outcomes. It can read and discuss Scripture, offer reflection, and pray with you. Important spiritual decisions belong with Scripture, prayer, wisdom, and trusted human community.",
  },
  {
    q: "Is this meant to replace church, my pastor, counseling, or prayer?",
    a: "No. El Roi Call is for moments when you want a thoughtful, Scripture-rooted conversation and no one is immediately available. It is not clergy, therapy, medical care, or crisis support, and it should point you toward healthy human relationships and appropriate professional care when needed.",
  },
  {
    q: "Is what I share private?",
    a: "Your unsubmitted draft stays in this tab and is cleared when you refresh or close the page. Before sensitive text is submitted, El Roi shows the AI, privacy, age, and consent notice. Calls may be recorded and transcribed as described in the Privacy Policy. El Roi conversations are not legally privileged, and we do not sell conversation content for advertising.",
  },
  {
    q: "What will El Roi remember about me?",
    a: "Your member room can show recent conversation summaries. Optional memory and individual memory controls are not available yet. Do not assume a new call remembers an earlier one. See the Privacy Policy for how submitted information and recordings are handled.",
  },
  {
    q: "What happens if I'm in crisis?",
    a: "The normal biblical-story experience should stop. El Roi is designed to drop the reflective tone and respond plainly with immediate human and emergency resources. It is not a crisis service and should never try to keep someone inside a devotional experience when urgent help is needed.",
  },
  {
    q: "What does it cost?",
    a: "The first guided call is free and does not require a card. Recurring membership is intentionally a separate decision after someone has experienced the core product. Review the price, billing date, and cancellation terms before choosing a membership.",
  },
];

export default function Faq() {
  return (
    <section id="questions" className="relative bg-[#17130e] text-[#efe6d6]">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeading
          align="center"
          eyebrow="Trust before immersion"
          title={
            <>
              Know exactly{" "}
              <span className="italic text-gold-bright">what this is.</span>
            </>
          }
        />

        <Reveal delay={0.15}>
          <Accordion type="single" collapsible className="mt-14">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-gold-faint">
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
