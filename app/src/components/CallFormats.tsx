import { ArrowRight, BookOpen, CalendarClock, Check, Clock3, GraduationCap, Headphones, Lightbulb, Mic2, ScrollText } from 'lucide-react';
import { Link } from 'react-router';

const CALL_FORMATS = [
  {
    id: 'bible_study',
    name: 'Bible study',
    description: 'Walk through a passage, its setting, and what it can mean for your life.',
    prompt: 'Help me understand Psalm 23',
    duration: '10–15 min',
    icon: BookOpen,
    featured: true,
  },
  {
    id: 'sermon',
    name: 'Short sermon',
    description: 'Receive a focused message of Scripture, encouragement, and one next step.',
    prompt: 'A short sermon about hope',
    duration: '5–10 min',
    icon: Mic2,
  },
  {
    id: 'story',
    name: 'Biblical story',
    description: 'Hear a Bible story told clearly, with its context and a thoughtful takeaway.',
    prompt: 'Tell me the story of Ruth',
    duration: '5–10 min',
    icon: ScrollText,
  },
  {
    id: 'bible_facts',
    name: 'Bible facts',
    description: 'Learn useful details about people, places, books, and the world of Scripture.',
    prompt: 'Bible facts about the early church',
    duration: '5 min',
    icon: Lightbulb,
  },
  {
    id: 'lecture',
    name: 'Bible lecture',
    description: 'Go deeper into history, themes, and the connections between biblical texts.',
    prompt: 'The historical setting of the Gospels',
    duration: '15 min',
    icon: GraduationCap,
  },
];

function planUrl(id: string, prompt: string) {
  const params = new URLSearchParams({ source: 'home_formats', content: id, topic: prompt });
  return `/schedule/?${params.toString()}`;
}

export default function CallFormats() {
  return <section id="calls" className="elroi-section elroi-call-value" aria-labelledby="call-formats-title">
    <div className="elroi-container">
      <div className="elroi-section-heading elroi-call-value-heading">
        <div><p className="elroi-kicker"><CalendarClock size={16} /> A CALL BUILT AROUND YOU</p><h2 id="call-formats-title">Choose what you want to hear.<br />We’ll call at your time.</h2></div>
        <p>Pick the kind of Bible experience you need, the voice you prefer, and how long you have. Schedule it once or make it part of your week.</p>
      </div>
      <div className="elroi-call-format-grid">
        {CALL_FORMATS.map(({ id, name, description, prompt, duration, icon: Icon, featured }) => <Link key={id} to={planUrl(id, prompt)} className="elroi-call-format" data-featured={featured || undefined}>
          <div className="elroi-call-format-top"><span className="elroi-icon-tile"><Icon size={22} /></span><span className="elroi-call-duration"><Clock3 size={14} /> {duration}</span></div>
          {featured && <span className="elroi-call-popular">MOST POPULAR</span>}
          <h3>{name}</h3><p>{description}</p><span className="elroi-call-example">“{prompt}”</span><span className="elroi-call-choose">Choose this call <ArrowRight size={17} /></span>
        </Link>)}
      </div>
      <div className="elroi-call-signup">
        <div className="elroi-call-signup-copy"><span className="elroi-icon-tile"><Check size={22} /></span><div><h3>Your first call is free.</h3><p>Create your account when you confirm. It keeps your schedules, voice choice, and call history together.</p></div></div>
        <div className="elroi-call-signup-actions"><Link className="elroi-button elroi-button-primary" to="/schedule/?source=home_formats">Plan my first call <CalendarClock size={18} /></Link><Link className="elroi-text-link" to="/account/?mode=signup&amp;source=home_formats">Create free account <ArrowRight size={16} /></Link></div>
      </div>
      <div className="elroi-call-proof" aria-label="Call choices"><span><CalendarClock size={18} /> Your time</span><span><Headphones size={18} /> Your voice</span><span><Clock3 size={18} /> 5, 10, or 15 minutes</span><span><Check size={18} /> One time or recurring</span></div>
    </div>
  </section>;
}
