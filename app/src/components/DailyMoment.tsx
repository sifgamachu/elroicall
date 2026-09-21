import { ArrowRight, BookOpen, Sun } from 'lucide-react';
import { Link } from 'react-router';
import { dailyMoment } from '@/lib/scripture-library';
import '@/scripture.css';

export default function DailyMoment() {
  const moment = dailyMoment();
  return <section className="daily-moment elroi-container" aria-labelledby="daily-moment-title"><div className="daily-moment-intro"><span className="elroi-kicker"><Sun size={17} /> A LITTLE SCRIPTURE, TODAY</span><h2 id="daily-moment-title">Leave with something<br />for your real life.</h2><p>A short reading, an honest question, and one small step. Free to explore. No account needed.</p><Link to="/explore/" className="elroi-text-link">Explore all reflections <ArrowRight size={17} /></Link></div><Link className="daily-moment-card" to={`/explore/${moment.id}/`}><div className="daily-moment-card-top"><span><BookOpen size={17} /> Today’s reflection</span><span>Read & reflect · ~3 min</span></div><h3>{moment.title}</h3><p>{moment.description}</p><blockquote>“{moment.quote}”<cite>{moment.verse} · KJV excerpt</cite></blockquote><span className="daily-moment-open">Take a moment <ArrowRight size={19} /></span></Link></section>;
}
