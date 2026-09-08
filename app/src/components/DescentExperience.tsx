import { BookOpen, MessageCircle, Sprout } from "lucide-react";

const STEPS = [
  { icon: MessageCircle, title: "Start with your life.", body: "A question, a hard day, something you cannot quite put into words. You choose where the conversation begins." },
  { icon: BookOpen, title: "Make room for Scripture.", body: "Explore a biblical story with the guide. Ask questions, consider its context, and talk about what resonates with you." },
  { icon: Sprout, title: "Take a thought with you.", body: "A passage to return to. A question worth sitting with. A prayer, if you want one. You decide what comes next." },
];

export default function DescentExperience() {
  return <section id="descent" className="elroi-section elroi-how"><div className="elroi-container"><div className="elroi-section-heading"><div><p className="elroi-kicker">HOW IT WORKS</p><h2>You bring the real.<br />We make room for it.</h2></div><p>There is no perfect way to begin.<br />Just your words, at your pace.</p></div><div className="elroi-steps">{STEPS.map(({icon: Icon, title, body},index) => <article key={title}><div className="elroi-step-top"><span className="elroi-icon-tile"><Icon size={24} /></span><span>0{index+1}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>;
}
