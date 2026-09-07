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
    a: "One AI guide: El Roi Guide. The guide can bring Job, Esther, Hagar, Ruth, Peter, and other biblical stories into the conversation, but it never pretends to be those people. Think of the biblical figures as witnesses and stories; the AI is the guide helping you enter them.",
  },
  {
    q: "Why one voice instead of a different voice for every biblical person?",
    a: "Because the relationship should be with a guide you can recognize, not with a collection of character performances. The same voice can slow down for grief, become steadier around fear, use more space when you're exhausted, and still remain recognizably the same companion every time you call.",
  },
  {
    q: "Does the AI speak for God?",
    a: "No. El Roi Call is named for Hagar's words in Genesis 16, but the AI does not claim divine revelation, private knowledge from God, or guaranteed outcomes. It can read and discuss Scripture, offer reflection, and pray with you. Important spiritual decisions belong with Scripture, prayer, wisdom, and trusted human community.",
  },
  {
    q: "Is this meant to replace church, my pastor, counseling, or prayer?",
    a: "No. El Roi Call is for the moments when you want a thoughtful, Scripture-rooted conversation and no one is immediately available. It is not clergy, therapy, medical care, or crisis support, and it should keep pointing you back toward healthy human relationships and appropriate professional care when needed.",
  },
  {
    q: "Is what I share private?",
    a: "We limit how your information is used and do not sell the content of your conversations for advertising. Calls may be recorded and transcribed, and information may be processed by the providers described in the Privacy Policy. El Roi Call conversations are not legally privileged. We are also moving the backend and retention rules into version-controlled infrastructure so these promises can be technically verified.",
  },
  {
    q: "What happens if I'm in crisis?",
    a: "The normal biblical-story experience should stop. The guide is designed to drop the immersive tone and respond plainly with immediate human and emergency resources. El Roi Call is not a crisis service and should never try to keep someone in a character or devotional experience when urgent help is needed.",
  },
  {
    q: "What does it cost?",
    a: "The first guided call is free and does not require a card. We are treating recurring membership as a separate decision after a person has experienced the core product. Any trial, recurring price, billing date, and cancellation terms should be shown clearly before someone subscribes.",
  },
];

export default function Faq() {
  return (
    <section id="questions" className="relative bg-ink-2/60">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeading
          align="center"
          eyebrow="Trust before immersion"
          title={
            <>
              Know exactly{" "}
              <span className="italic text-gold-bright">who is on the line.</span>
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
