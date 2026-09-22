import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { ArrowRight, BookOpen, Headphones, Phone, Sprout } from 'lucide-react';
import AutumnShell from '@/components/AutumnShell';
import { AUTUMN_READINGS, AUTUMN_PROGRESS_KEY, parseAutumnProgress, readingCallUrl } from '@/lib/autumn-readings';

import ReadingImage from '@/components/ReadingImage';
import { artworkForDay, READING_SCENES, sceneSource, type ReadingScene } from '@/lib/reading-artwork';
import { useSeason } from '@/lib/seasonal-context';
import { PHONE_TEL } from '@/lib/phone';

const cards: { week: string; title: string; description: string; scene: ReadingScene }[] = [
  {week:'01',title:'Beginnings & Rescue',description:'A God who creates, calls, and delivers.',scene:'rescue'},
  {week:'06',title:'Prayer & Worship',description:'Real people. Honest prayers. A faithful God.',scene:'worship'},
  {week:'12',title:'Hope & New Creation',description:'A renewed world. A trusting people. A lasting hope.',scene:'new-creation'},
];
export default function AutumnHome() {
  const season = useSeason();
  const [completed] = useState(() => { try { return parseAutumnProgress(localStorage.getItem(AUTUMN_PROGRESS_KEY)); } catch { return []; } });
  if (!season) return <Navigate to="/journey/" replace/>;
  const reading = AUTUMN_READINGS.find(day => !completed.includes(day.day)) || AUTUMN_READINGS[0];
  const artwork = artworkForDay(reading.day)!;
  return <AutumnShell home><section className="autumn-hero" aria-labelledby="autumn-title">
    <picture><source media="(max-width: 640px)" srcSet="/images/autumn-valley-960.webp"/><img className="autumn-hero-image" src="/images/autumn-valley.webp" srcSet="/images/autumn-valley-1280.webp 1280w, /images/autumn-valley.webp 1672w" sizes="100vw" alt="Golden autumn forests, cascading waterfalls and a clear river beneath misty mountain peaks" width="1672" height="941" fetchPriority="high"/></picture>
    <div className="autumn-hero-shade"/><div className="autumn-width autumn-hero-content"><p className="autumn-eyebrow">OCTOBER 1 — DECEMBER 31 · 2026</p><h1 id="autumn-title">The whole Bible.<br/>One unfolding story.</h1><p className="autumn-hero-subtitle">84 reading days · 66 books · One shared journey</p><div className="autumn-actions"><Link className="autumn-button" to="/journey/">Join the October journey</Link><Link className="autumn-button autumn-button-outline" to="/journey/1/">Preview Day 1</Link></div><p className="autumn-hero-note">A seasonal journey from ElroiCall—the God who sees you.</p><div className="autumn-core-actions"><Link to="/schedule/"><Phone size={17}/>Schedule a Bible call</Link><a href={PHONE_TEL}>Call now <ArrowRight size={16}/></a></div></div>
    <div className="autumn-width autumn-hero-foot"><span>SAME STORY.<br/>A BRIGHTER YOU.</span><span>SCRIPTURE<br/>FOR REAL LIFE</span></div>
  </section>
  <section className="autumn-width autumn-foundation" aria-labelledby="elroi-foundation-title"><div><p className="autumn-eyebrow">THE HEART OF ELROICALL</p><h2 id="elroi-foundation-title">You are seen.<br/>In every season.</h2><p>Start with what’s on your heart. Explore Scripture with your AI guide, choose a Bible study or story, and make room for reflection and prayer.</p></div><div className="autumn-foundation-links"><Link to="/begin/">Start a conversation <ArrowRight size={18}/></Link><Link to="/">Explore call journeys <ArrowRight size={18}/></Link><Link to="/explore/">Read a short reflection <ArrowRight size={18}/></Link></div></section>
  <section className="autumn-pause"><Sprout aria-hidden="true"/><div><h2>A clear path. Room to catch up.</h2><p>84 reading days + 8 flexible days</p></div><span>ANCIENT TRUTH<br/>FOR TODAY</span></section>
  <section className="autumn-width autumn-chapters"><div className="autumn-section-heading"><div><p className="autumn-eyebrow">FROM GENESIS TO REVELATION</p><h2>Your journey through Scripture</h2></div><Link className="autumn-text-link" to="/journey/">Explore all 12 weeks <ArrowRight size={18}/></Link></div><div className="autumn-cards">{cards.map(card=><Link className="autumn-card" key={card.week} to={`/journey/#week-${Number(card.week)}`}><img src={sceneSource(card.scene, 'small')} alt={READING_SCENES[card.scene]} width="640" height="360" loading="lazy"/><div><p className="autumn-eyebrow">WEEK {card.week}</p><h3>{card.title}</h3><p>{card.description}</p><span className="autumn-card-link">Open the readings <ArrowRight size={16}/></span></div></Link>)}</div></section>
  <section className="autumn-width autumn-daily"><div className="autumn-daily-copy"><p className="autumn-eyebrow">ONE DAY AT A TIME</p><h2>A little rhythm.<br/>A deeper understanding.</h2><p>Open your Bible. Notice the story. Make space to reflect. Start on October 1, or begin whenever you’re ready.</p><ul><li><BookOpen size={21}/><span><strong>Read the full story</strong>14–15 chapters a day, with every assignment ready.</span></li><li><Headphones size={21}/><span><strong>Find your starting point</strong>A short overview and a question to guide your reading.</span></li><li><Phone size={21}/><span><strong>Take it into a conversation</strong>Choose a time for an AI-guided call about your passage.</span></li></ul></div><article className="autumn-day-preview"><p className="autumn-eyebrow">{completed.length ? "YOUR NEXT READING · " : ""}DAY {String(reading.day).padStart(2,'0')} OF 84</p><ReadingImage artwork={artwork} lazy/><h3>{artwork.title}</h3><p>{reading.passage.replaceAll('-','–')}</p><Link className="autumn-button" to={`/journey/${reading.day}/`}>Open Day {reading.day} <ArrowRight size={17}/></Link><Link className="autumn-button autumn-button-outline" to={readingCallUrl(reading)}><Phone size={17}/>Choose my call time</Link><span><Sprout size={18}/>Continue at your pace.</span></article></section>
  </AutumnShell>;
}
