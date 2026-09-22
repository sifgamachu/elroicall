import { ArrowRight, BookOpen, CalendarClock, Sun } from 'lucide-react';
import { Link } from 'react-router';
import { dailyMoment } from '@/lib/scripture-library';
import '@/scripture.css';

export default function DailyMoment() {
  const moment = dailyMoment();
  const followUp=new URLSearchParams({content:'bible_study',topic:moment.title,source:'daily_moment'});
  return <section className="daily-moment elroi-container" aria-labelledby="daily-moment-title"><div className="daily-moment-intro"><span className="elroi-kicker"><Sun size={17} /> A LITTLE SCRIPTURE, TODAY</span><h2 id="daily-moment-title">Start with something useful<br />for your real life.</h2><p>A short reading, an honest question, and one small step. Free to explore. No account needed.</p><Link to="/explore/" className="elroi-text-link">Explore all reflections <ArrowRight size={17} /></Link></div><div className="daily-moment-value"><Link className="daily-moment-card" to={`/explore/${moment.id}/`}><div className="daily-moment-card-top"><span><BookOpen size={17} /> Today’s reflection</span><span>Read & reflect · ~3 min</span></div><h3>{moment.title}</h3><p>{moment.description}</p><blockquote>“{moment.quote}”<cite>{moment.verse} · KJV excerpt</cite></blockquote><span className="daily-moment-open">Take a moment <ArrowRight size={19} /></span></Link><div className="daily-moment-followup"><span><CalendarClock size={18}/><span><strong>Want to keep going?</strong><small>Turn today’s theme into a call at your time.</small></span></span><Link to={`/schedule/?${followUp.toString()}`}>Plan the follow-up <ArrowRight size={16}/></Link></div></div></section>;
}
