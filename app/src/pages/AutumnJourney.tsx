import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Phone, Play, Square, Sprout } from 'lucide-react';
import AutumnShell from '@/components/AutumnShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AUTUMN_PROGRESS_KEY, AUTUMN_READINGS, AUTUMN_WEEKS, parseAutumnProgress, readingCallUrl, readingForDay, readingPassageUrl, type AutumnReading } from '@/lib/autumn-readings';
import ReadingImage from '@/components/ReadingImage';
import { artworkForDay } from '@/lib/reading-artwork';
import { useSeason } from '@/lib/seasonal-context';
import { speechChunks } from '@/lib/scripture-library';

function ListenOverview({reading}:{reading:AutumnReading}) {
  const [playing,setPlaying]=useState(false);
  const [error,setError]=useState('');
  const generation=useRef(0);
  const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const supported=typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
  useEffect(()=>{const sequence=generation;const active=utteranceRef;const clock=timer;return()=>{sequence.current++;clearTimeout(clock.current);if(active.current&&'speechSynthesis' in window)window.speechSynthesis.cancel();active.current=null;};},[]);
  function stop(){generation.current++;clearTimeout(timer.current);if(supported)window.speechSynthesis.cancel();utteranceRef.current=null;setPlaying(false);}
  function listen(){
    if(!supported)return;if(playing){stop();return;}stop();setError('');setPlaying(true);
    const token=generation.current;
    const chunks=speechChunks(`Day ${reading.day}. Today's Bible reading is ${reading.passage}. This is a brief overview, not the full Bible reading. ${reading.concept} As you read: ${reading.notice} A question to reflect on: ${reading.question}`);
    let index=0;
    const fail=()=>{if(token!==generation.current)return;stop();setError('Audio could not play here. Your overview is available in the Read tab.');};
    const next=()=>{if(token!==generation.current)return;clearTimeout(timer.current);if(index===chunks.length){utteranceRef.current=null;setPlaying(false);return;}const utterance=new SpeechSynthesisUtterance(chunks[index++]);utteranceRef.current=utterance;utterance.lang='en-US';utterance.rate=.92;utterance.onend=next;utterance.onerror=fail;timer.current=setTimeout(fail,30000);try{window.speechSynthesis.speak(utterance);}catch{fail();}};
    next();
  }
  return <div className="autumn-overview"><button className="autumn-listen" disabled={!supported} onClick={listen} type="button">{playing?<Square size={21}/>:<Play size={21}/>}<span>{playing?'Stop overview':'Listen to the short overview'}<small>Uses your device’s reading voice</small></span></button><p>The full Bible reading is separate. This brief introduction helps you know what to notice.</p>{!supported&&<p>Audio is unavailable in this browser. You can read the overview in the Read tab.</p>}{error&&<p role="status">{error}</p>}</div>;
}
function DayReader({reading,completed,toggle,notice}:{reading:AutumnReading;completed:number[];toggle:(day:number)=>void;notice:string}) {
  const done=completed.includes(reading.day);
  const artwork = artworkForDay(reading.day)!;
  return <div className="autumn-reader"><Link className="autumn-text-link" to={`/journey/#week-${Math.ceil(reading.day/7)}`}><ArrowLeft size={17}/>All readings</Link><div className="autumn-reader-progress"><span>DAY {String(reading.day).padStart(2,'0')} OF 84</span><progress value={completed.length} max={84} aria-label={`${completed.length} of 84 readings complete`}/></div><figure className="reading-artwork"><ReadingImage className="autumn-reader-image" artwork={artwork}/><figcaption>{artwork.title} · {artwork.reference}<span>Scripture-inspired artwork</span></figcaption></figure><header><p className="autumn-eyebrow">WEEK {Math.ceil(reading.day/7)} · {AUTUMN_WEEKS[Math.floor((reading.day-1)/7)]}</p><h1>{artwork.title}</h1><p>{reading.passage.replaceAll('-', '–')}</p></header>
    <Tabs defaultValue="read" className="autumn-tabs"><TabsList aria-label="Reading mode"><TabsTrigger value="read">Read</TabsTrigger><TabsTrigger value="listen">Listen</TabsTrigger><TabsTrigger value="reflect">Reflect</TabsTrigger></TabsList><TabsContent value="read"><div className="autumn-overview"><p className="autumn-eyebrow">THE BIG PICTURE</p><h2>{reading.concept}</h2><p>{reading.notice}</p><p className="autumn-reader-tip">Read the assigned chapters in your own Bible, or open them below. You can split the reading between morning and evening.</p></div></TabsContent><TabsContent value="listen"><ListenOverview reading={reading}/></TabsContent><TabsContent value="reflect"><div className="autumn-overview"><p className="autumn-eyebrow">PAUSE WITH THE STORY</p><h2>{reading.question}</h2><p>What does this passage show you about God? What would you like to understand more deeply?</p></div></TabsContent></Tabs>
    <a className="autumn-button autumn-reading-cta" href={readingPassageUrl(reading.passage)} target="_blank" rel="noopener noreferrer">Open the full Bible reading <ArrowUpRight size={18}/></a><p className="autumn-small">Opens Bible Gateway · King James Version</p><button type="button" className="autumn-complete" aria-pressed={done} onClick={()=>toggle(reading.day)}><Check size={18}/>{done?'Reading complete · undo':'Mark reading complete'}</button>{notice&&<p role="status" className="autumn-small">{notice}</p>}
    <section className="autumn-call-card"><Phone size={25}/><div><h2>Your guide, by phone</h2><p>A conversation about {reading.passage.replaceAll('-','–')}.</p></div><Link className="autumn-button autumn-button-outline" to={readingCallUrl(reading)}>Choose my call time</Link><p className="autumn-small">Review the time, voice, and call length before confirming.</p></section>
    <nav className="autumn-day-pagination" aria-label="Reading days">{reading.day>1?<Link to={`/journey/${reading.day-1}/`}><ArrowLeft size={17}/>Day {reading.day-1}</Link>:<span/>}{reading.day<84?<Link to={`/journey/${reading.day+1}/`}>Day {reading.day+1}<ArrowRight size={17}/></Link>:<Link to="/journey/">View your journey<Check size={17}/></Link>}</nav><p className="autumn-reader-end"><Sprout size={19}/>Continue at your pace.</p>
  </div>;
}
export default function AutumnJourney() {
  const {day}=useParams();
  const season = useSeason();
  const [completed,setCompleted]=useState<number[]>(()=>{try{return parseAutumnProgress(localStorage.getItem(AUTUMN_PROGRESS_KEY));}catch{return [];}});
  const [notice,setNotice]=useState('');
  const volatile=useRef(false);
  useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key===AUTUMN_PROGRESS_KEY||event.key===null)setCompleted(parseAutumnProgress(event.newValue));};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  function toggle(value:number){let current=completed;if(!volatile.current){try{current=parseAutumnProgress(localStorage.getItem(AUTUMN_PROGRESS_KEY));}catch{/* Preserve progress for this visit. */}}const next=current.includes(value)?current.filter(item=>item!==value):[...current,value];setCompleted(next);try{localStorage.setItem(AUTUMN_PROGRESS_KEY,JSON.stringify(next));volatile.current=false;setNotice('Progress saved on this device.');}catch{volatile.current=true;setNotice('Your browser could not save progress. This change lasts for this visit only.');}}
  const reading=readingForDay(day);
  if(day&&!reading)return <AutumnShell><div className="autumn-width autumn-journey-intro"><h1>Let’s find your next reading.</h1><p>The journey has 84 reading days.</p><Link className="autumn-button" to="/journey/">See all readings</Link></div></AutumnShell>;
  if(reading)return <AutumnShell><DayReader key={reading.day} reading={reading} completed={completed} toggle={toggle} notice={notice}/></AutumnShell>;
  const next=AUTUMN_READINGS.find(item=>!completed.includes(item.day));
  return <AutumnShell><section className="autumn-width autumn-journey-intro"><p className="autumn-eyebrow">{season ? season.label : "YOUR BIBLE READING JOURNEY"}</p><h1>One story.<br/>A place for every day.</h1><p>Read all 66 books in 84 reading days. {season ? "The October–December plan includes 8 flexible days. " : ""}Start whenever you’re ready. Every day is open.</p><Link className="autumn-button" to={`/journey/${next?.day||1}/`}>{completed.length===84?'Revisit Day 1':completed.length?`Continue with Day ${next?.day}`:'Begin with Day 1'}<ArrowRight size={18}/></Link><div className="autumn-journey-progress"><span>{completed.length} of 84 readings complete</span><progress value={completed.length} max={84} aria-label="Reading progress"/><p>Progress stays in this browser. No account needed to read.</p></div></section><div className="autumn-width autumn-weeks">{AUTUMN_WEEKS.map((title,index)=><section id={`week-${index+1}`} className="autumn-week" key={title}><div><p className="autumn-eyebrow">WEEK {String(index+1).padStart(2,'0')}</p><h2>{title}</h2></div><ol>{AUTUMN_READINGS.slice(index*7,index*7+7).map(item=><li key={item.day}><Link to={`/journey/${item.day}/`}><span className="autumn-day-number">{completed.includes(item.day)?<Check size={18} aria-label="Completed"/>:String(item.day).padStart(2,'0')}</span><span><small>DAY {item.day} · {artworkForDay(item.day)!.title}</small>{item.passage.replaceAll('-','–')}</span><ArrowRight size={17}/></Link></li>)}</ol></section>)}</div><section className="autumn-width autumn-journey-close"><BookOpen/><p>This plan covers the 1,189 chapters of the 66-book Protestant Bible. Daily assignments follow your 84-day reading challenge. Overviews help you prepare; they do not replace reading Scripture.</p><Link className="autumn-text-link" to="/explore/">Looking for a shorter reflection?<ArrowRight size={17}/></Link></section></AutumnShell>;
}
