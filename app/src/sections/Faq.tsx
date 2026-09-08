import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can El Roi call me at a time I choose?", a: "The separate scheduling service lets you choose Bible study, a sermon, a lecture, a biblical story, or Bible facts, along with a voice, a topic, and your preferred time. The schedule page shows whether booking is available. You can still call El Roi yourself anytime." },
  { q: "Who am I speaking with?", a: "El Roi Guide is AI. It offers biblical reflection in a consistent guide experience, explores stories from Scripture, and can pray with you if you want. It does not impersonate biblical people or claim to speak for God." },
  { q: "How do I start a conversation?", a: "Call the El Roi phone number, or write a few words here first. Before your writing is submitted, you can review it and consent to AI processing. If you prepare a call online, use the phone number you entered when you dial us." },
  { q: "Is the first call really free?", a: "Your first guided call is free and requires no payment card. Recurring membership is a separate choice. Review the price, billing date, and cancellation terms before subscribing." },
  { q: "What happens to what I share?", a: "An unsubmitted draft stays in this tab and is cleared when you refresh or close the page. After you consent and submit it, the service processes your words to prepare a reflection. Calls are recorded under the current Privacy Policy and are not legally privileged. Please read that policy before sharing sensitive information." },
  { q: "Will El Roi remember earlier conversations?", a: "Your member room can show recent conversation summaries. Optional memory and individual memory controls are still being developed. Do not assume a new call remembers an earlier one." },
  { q: "Can I use this alongside church or counseling?", a: "El Roi is for spiritual encouragement and reflection. It is not clergy, therapy, medical care, or a crisis service. Keep trusted people and qualified professionals involved in important decisions. In an immediate emergency, contact local emergency services; in the U.S., call or text 988 for crisis support." },
];

export default function Faq() {
  return <section id="questions" className="elroi-section elroi-faq"><div className="elroi-container elroi-faq-grid"><div><p className="elroi-kicker">A FEW THINGS TO KNOW</p><h2>Clarity builds<br />trust.</h2><p className="elroi-section-copy">Understand the experience before you share.</p><Link to="/about/" className="elroi-text-link">More about El Roi<ArrowUpRight size={17} /></Link></div><Accordion type="single" collapsible className="elroi-accordion">{FAQS.map((faq,index) => <AccordionItem key={faq.q} value={`question-${index}`}><AccordionTrigger>{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}
