import { ArrowRight, BookOpenCheck, CloudSun, Compass, HeartHandshake, MoonStar, Mountain, PhoneCall, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { JOURNEYS, type JourneySlug } from '@/lib/scheduled-calls';

const icons:Record<JourneySlug,typeof CloudSun>={
  peace:CloudSun,
  grief:HeartHandshake,
  sleep:MoonStar,
  purpose:Compass,
  courage:Mountain,
  foundations:BookOpenCheck,
};

function journeyUrl(id:JourneySlug,topic:string){
  const query=new URLSearchParams({journey:id,topic,source:'home_journeys'});
  return `/schedule/?${query.toString()}`;
}

export default function CallJourneys(){
  return <section className="elroi-section elroi-journeys" aria-labelledby="journeys-title">
    <div className="elroi-container">
      <div className="elroi-section-heading elroi-journeys-heading"><div><p className="elroi-kicker"><Sparkles size={16}/> BEGIN WITH YOUR REAL LIFE</p><h2 id="journeys-title">What do you need<br/>right now?</h2></div><div><p>Choose a seven-day journey. El Roi calls at your time, walks with you through Scripture, and leaves one truth, one next step, and one prayer in your dashboard.</p><span><PhoneCall size={16}/> Seven daily calls · then it ends automatically</span></div></div>
      <div className="elroi-journey-grid">{JOURNEYS.map((journey,index)=>{const Icon=icons[journey.id];return <Link key={journey.id} to={journeyUrl(journey.id,journey.topic)} className="elroi-journey-card" data-featured={index===0||undefined}><div><span className="elroi-journey-icon"><Icon size={22}/></span><span className="elroi-journey-count">7 CALLS</span></div><p>{journey.need}</p><h3>{journey.name}</h3><span>{journey.description}</span><strong>Choose this journey <ArrowRight size={17}/></strong></Link>;})}</div>
      <div className="elroi-journey-footer"><div><strong>Not ready to schedule?</strong><span>Begin with today’s free three-minute reflection. No account needed.</span></div><Link to="/explore/" className="elroi-button elroi-button-secondary">Try something free <ArrowRight size={17}/></Link></div>
    </div>
  </section>;
}
