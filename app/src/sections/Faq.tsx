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
    a: "It is a new format for an old practice: bringing what hurts into the light of Scripture. El Roi Call does not claim that a biblical person is literally on the phone or that the AI is speaking for God. The experience is built around carefully framed biblical stories, reflection, and prayer — and it should always be judged by whether it points you back toward Scripture, wisdom, and real community.",
  },
  {
    q: "Am I talking to a real person?",
    a: "No. The voices are AI-generated companions inspired by biblical figures and their scriptural stories. They are not the actual biblical people, not God, not clergy, and not counselors. We tell you this before a guided call begins, and the voice should never pretend otherwise.",
  },
  {
    q: "Is this meant to replace church, my pastor, or prayer?",
    a: "Never. El Roi Call is for the moments between Sundays — a companion to your faith life, not a substitute for your church, your people, your pastor, or your own prayer. The experience should keep pointing you back toward Scripture and real human community.",
  },
  {
    q: "Is what I share private?",
    a: "We limit how your information is used and we do not sell the content of your conversations for advertising. But calls may be recorded and transcribed, and information can be processed by the service providers described in our Privacy Policy. El Roi Call conversations are not legally privileged. Anonymous prayer requests are designed to be stored without your name or phone number and removed after 72 hours.",
  },
  {
    q: "What tradition is this rooted in?",
    a: "The product is built around the Bible itself. Each companion is grounded in a specific scriptural story. Because Christians can interpret some passages differently, AI responses should be treated as spiritual reflection rather than authoritative doctrine, and important questions should be taken back to Scripture and trusted spiritual leaders.",
  },
  {
    q: "What does it cost, and can I cancel?",
    a: "Your first guided call is free and does not require a card. If you choose membership afterward, the current offer includes a 7-day trial and then $39 per month for unlimited calls and the Well experiences. Membership can be canceled according to the billing terms shown when you subscribe.",
  },
];

export default function Faq() {
  return (
    <section id="questions" className="relative bg-ink-2/60">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeading
          align="center"
          eyebrow="Clear answers before you trust us"
          title={
            <>
              You should know exactly{" "}
              <span className="italic text-gold-bright">what this is</span>
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
