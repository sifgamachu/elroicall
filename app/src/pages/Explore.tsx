import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, ArrowUpRight, BookOpen, Bookmark, CalendarClock, Check, ChevronRight, CircleHelp, Heart, Lightbulb, ListChecks, Search, Share2, Sparkles, Trash2 } from 'lucide-react';
import ProductShell from '@/components/ProductShell';
import MomentListen from '@/components/MomentListen';
import { dailyMoment, getMoment, nextPathMoment, passageUrl, SCRIPTURE_MOMENTS, searchMoments, SEVEN_DAY_PATH, type ScriptureMoment } from '@/lib/scripture-library';
import { useReadingProgress } from '@/lib/use-reading-progress';
import { useDraft } from '@/lib/draft';
import '@/scripture.css';

type Progress = ReturnType<typeof useReadingProgress>;

function reflectionCallUrl(moment: ScriptureMoment) {
  const params = new URLSearchParams({
    source: 'reflection',
    content: 'bible_study',
    topic: `Help me study ${moment.passage}: ${moment.title}`,
  });
  return `/schedule/?${params.toString()}`;
}

function MomentReader({ moment, reading }: { moment: ScriptureMoment; reading: Progress }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [shared, setShared] = useState('');
  const { setDraft } = useDraft();
  const navigate = useNavigate();
  const { progress, toggle, storageError } = reading;
  const saved = progress.saved.includes(moment.id);
  const completed = progress.completed.includes(moment.id);
  const next = nextPathMoment(progress.completed);
  async function share() {
    const url = `https://elroicall.com/explore/${moment.id}/`;
    try { await navigator.clipboard.writeText(url); setShared('Reflection link copied.'); }
    catch { setShared(`Copy this link: ${url}`); }
  }
  function reflect() { setDraft(`I have been reading ${moment.passage}, about ${moment.person}. I would like to reflect on this question: ${moment.question}`); navigate('/begin/'); }
  return <ProductShell backHref="/explore/" backLabel="All reflections">
    <article className="moment-reader">
      <header className="moment-heading"><p className="elroi-kicker">{moment.person.toUpperCase()} · {moment.theme.toUpperCase()}</p><h1>{moment.title}</h1><p>{moment.description}</p><div className="moment-meta"><span><BookOpen size={16} /> {moment.passage}</span><span>Read & reflect · ~3 min</span><span>No account needed</span></div></header>
      <div className="moment-toolbar"><MomentListen moment={moment} /><div><button className="moment-icon-action" type="button" aria-pressed={saved} onClick={() => toggle('saved', moment.id)}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Bookmarked here' : 'Bookmark on this device'}</button><button className="moment-icon-action" type="button" onClick={() => void share()}><Share2 size={18} />Copy link</button></div></div>
      {shared && <p className="moment-feedback" role="status">{shared}</p>}{storageError && <p className="moment-feedback" role="status">{storageError}</p>}
      <div className="moment-reading-grid"><div className="moment-main-copy">
        <section className="moment-scripture"><span className="elroi-kicker">BEGIN WITH SCRIPTURE</span><blockquote>“{moment.quote}”</blockquote><p>{moment.verse} · King James Version excerpt</p><a href={passageUrl(moment)} target="_blank" rel="noopener noreferrer">Read the full passage on Bible Gateway <ArrowUpRight size={16} /></a></section>
        <section><p className="elroi-kicker">THE STORY · SUMMARY</p><h2>A moment in the larger story.</h2><p>{moment.story}</p></section>
        <section><p className="elroi-kicker">A REFLECTION FOR TODAY</p><h2>Bring it into your life.</h2><p>{moment.reflection}</p></section>
        <section className="moment-question"><CircleHelp size={22} /><h2>{moment.question}</h2><p>You can simply sit with this question. There is no answer to submit.</p><button type="button" className="elroi-text-link" onClick={reflect}>Explore this with the AI guide <ArrowRight size={16} /></button></section>
        <section className="moment-action"><span><Check size={20} /></span><div><p className="elroi-kicker">ONE SMALL STEP</p><h2>Something to carry with you.</h2><p>{moment.action}</p></div></section>
        <section className="moment-prayer"><Heart size={22} /><p className="elroi-kicker">A PRAYER YOU CAN MAKE YOUR OWN</p><p>{moment.prayer}</p></section>
      </div><aside className="moment-sidebar">
        <section className="moment-fact"><Lightbulb size={24} /><p className="elroi-kicker">A BIBLE FACT</p><h2>Notice the detail.</h2><p>{moment.fact}</p><a href={passageUrl(moment)} target="_blank" rel="noopener noreferrer">See it in {moment.passage} <ArrowUpRight size={15} /></a></section>
        <section className="moment-quiz"><p className="elroi-kicker">CHECK WHAT YOU NOTICED</p><h2>{moment.quiz.question}</h2><div>{moment.quiz.options.map((option, index) => <button key={option} type="button" aria-pressed={answer === index} data-selected={answer === index} onClick={() => setAnswer(index)}>{option}{answer === index && <Check size={16} />}</button>)}</div>{answer !== null && <p className="moment-quiz-answer" role="status"><strong>{answer === moment.quiz.answer ? 'That’s right. ' : 'Take another look. '}</strong>{moment.quiz.explanation}</p>}</section>
        <section className="moment-next"><ListChecks size={23} /><h2>Build a gentle rhythm.</h2><p>Read at your pace. Your bookmarks and completed readings stay in this browser.</p><button className="elroi-button elroi-button-primary" type="button" aria-pressed={completed} onClick={() => toggle('completed', moment.id)}>{completed ? <><Check size={17} />Completed · undo</> : 'Mark reflection complete'}</button>{completed && next && <Link className="elroi-text-link" to={`/explore/${next.id}/`}>Next in the seven-day path <ArrowRight size={16} /></Link>}{completed && !next && <p>You have completed all seven readings. Revisit any one whenever you need it.</p>}<Link className="elroi-text-link" to="/explore/#seven-days">See the seven-day path <ChevronRight size={16} /></Link></section>
      </aside></div>
      <section className="moment-account"><span className="elroi-icon-tile"><CalendarClock size={23} /></span><div><p className="elroi-kicker">KEEP GOING BY PHONE</p><h2>Turn this reflection into a conversation.</h2><p>Choose a time, voice, and call length. We’ll start with {moment.passage} and the question you just considered. Create your free account when you confirm.</p></div><Link className="elroi-button elroi-button-dark" to={reflectionCallUrl(moment)}>Schedule a call about this <ArrowUpRight size={17} /></Link></section>
      <p className="moment-editorial">Scripture excerpts: KJV. Story summaries, reflections, and suggested prayers are original companion material, not additional Bible verses. Read the linked passage in its context.</p>
    </article>
  </ProductShell>;
}

export default function Explore() {
  const { momentId } = useParams();
  const reading = useReadingProgress();
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('All');
  const [onlySaved, setOnlySaved] = useState(false);
  const [notice, setNotice] = useState('');
  if (momentId) {
    const moment = getMoment(momentId);
    if (!moment) return <ProductShell title="Let’s find you a reading." description="That reflection is not in the library. Choose one of the readings below to continue."><Link to="/explore/" className="elroi-button elroi-button-primary">Open the Scripture library <ArrowRight size={18} /></Link></ProductShell>;
    return <MomentReader key={moment.id} moment={moment} reading={reading} />;
  }
  const today = dailyMoment();
  const next = nextPathMoment(reading.progress.completed);
  const finished = SEVEN_DAY_PATH.filter(id => reading.progress.completed.includes(id)).length;
  const moments = searchMoments(query, theme, onlySaved ? reading.progress.saved : undefined);
  return <ProductShell eyebrow="FREE SCRIPTURE LIBRARY" title="A little truth for your everyday." description="Read a story. Find a useful detail. Leave with one small step. Start wherever life has you today.">
    <div className="scripture-library">
      <section className="library-feature"><div><p className="elroi-kicker"><Sparkles size={16} /> TODAY’S REFLECTION</p><h2>{today.title}</h2><p>{today.description}</p><Link className="elroi-button elroi-button-primary" to={`/explore/${today.id}/`}>Read today’s reflection <ArrowRight size={18} /></Link><span className="library-free">About 3 minutes to read & reflect · No signup</span></div><blockquote>“{today.quote}”<cite>{today.verse} · KJV excerpt</cite></blockquote></section>
      <section id="seven-days" className="library-path"><div className="library-section-heading"><div><p className="elroi-kicker">A SIMPLE PLACE TO START</p><h2>Seven days. Room to grow.</h2><p>One short reflection at a time. Every day is open; there is no streak to lose.</p></div><span className="library-count">{finished} / 7 complete</span></div><ol>{SEVEN_DAY_PATH.map((id, index) => { const item = getMoment(id)!; const done = reading.progress.completed.includes(id); return <li key={id}><Link to={`/explore/${id}/`}><span className="library-day" data-complete={done}>{done ? <Check size={18} /> : index + 1}</span><span><small>DAY {index + 1}{done ? ' · COMPLETE' : ''}</small><strong>{item.theme}</strong><span>{item.person}</span></span><ChevronRight size={17} /></Link></li>; })}</ol><div className="library-path-footer"><p>Progress is saved on this browser when you mark a reading complete.</p><Link className="elroi-text-link" to={`/explore/${next?.id || SEVEN_DAY_PATH[0]}/`}>{finished === 7 ? 'Revisit the path' : finished ? 'Continue the path' : 'Start day one'} <ArrowRight size={16} /></Link></div></section>
      <section aria-labelledby="all-reflections"><div className="library-section-heading"><div><p className="elroi-kicker">SCRIPTURE FOR REAL LIFE</p><h2 id="all-reflections">What would help today?</h2></div><label className="library-search"><Search size={18} /><span className="sr-only">Search reflections</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try rest, Ruth, or Genesis…" /></label></div><div className="library-filters"><label>Choose a theme<select value={theme} onChange={event => setTheme(event.target.value)}><option>All</option>{[...new Set(SCRIPTURE_MOMENTS.map(moment => moment.theme))].map(value => <option key={value}>{value}</option>)}</select></label><button type="button" aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Bookmark size={17} />{onlySaved ? 'Showing bookmarks' : 'My bookmarks'}<span>{reading.progress.saved.length}</span></button><span role="status">{moments.length} {moments.length === 1 ? 'reflection' : 'reflections'}</span></div>
        <div className="library-grid">{moments.map(moment => <Link className="library-card" key={moment.id} to={`/explore/${moment.id}/`}><div><span>{moment.theme}</span>{reading.progress.saved.includes(moment.id) ? <Bookmark size={18} fill="currentColor" aria-label="Bookmarked" /> : <BookOpen size={19} />}</div><h3>{moment.title}</h3><p>{moment.description}</p><span className="library-card-footer"><span>{moment.person} · {moment.passage}</span><ArrowUpRight size={18} /></span></Link>)}</div>
        {!moments.length && <div className="library-empty"><BookOpen size={28} /><h3>{onlySaved && !reading.progress.saved.length ? 'Your next good read can stay close.' : 'Try a different starting point.'}</h3><p>{onlySaved && !reading.progress.saved.length ? 'Open a reflection and choose “Bookmark on this device” to find it here later.' : 'Search a person, a passage, or a theme. You can also browse every reflection.'}</p><button type="button" className="elroi-text-link" onClick={() => { setOnlySaved(false); setQuery(''); setTheme('All'); }}>Show all reflections <ArrowRight size={16} /></button></div>}
      </section>
      <div className="library-storage"><p>Bookmarks and reading progress stay on this device. They are separate from account notes and do not sync between devices.</p>{(reading.progress.saved.length > 0 || reading.progress.completed.length > 0) && <button type="button" onClick={() => { if (reading.clear()) setNotice('Your bookmarks and completed readings were cleared from this browser.'); }}><Trash2 size={15} />Clear my browser progress</button>}{(reading.storageError || notice) && <p role="status">{reading.storageError || notice}</p>}</div>
      <section className="moment-account"><span className="elroi-icon-tile"><Heart size={23} /></span><div><p className="elroi-kicker">YOUR CALL, YOUR CHOICE</p><h2>Take Scripture with you.</h2><p>Choose a study, sermon, story, lecture, or Bible facts. We’ll call at your time with the voice and length you prefer.</p></div><div className="moment-account-actions"><Link className="elroi-button elroi-button-dark" to="/schedule/?source=library">Plan my first free call <CalendarClock size={17} /></Link><Link className="elroi-text-link" to="/account/?mode=signup&amp;source=library">Create free account <ArrowRight size={16} /></Link></div></section>
    </div>
  </ProductShell>;
}
