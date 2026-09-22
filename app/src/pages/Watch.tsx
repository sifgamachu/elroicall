import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Copy, MessageCircle, Play, Youtube } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import Nav from '@/sections/Nav';
import Footer from '@/sections/Footer';
import { useDraft } from '@/lib/draft';
import { CHANNEL_MESSAGES, channelMessage, messageConversationDraft, messagePath, messageScheduleUrl, messageThumbnail, youtubeVideoUrl, YOUTUBE_CHANNEL_URL, type ChannelMessage } from '@/lib/youtube-channel';
import { readingPassageUrl } from '@/lib/autumn-readings';
import '@/watch.css';

function VideoPlayer({ message }: { message: ChannelMessage }) {
  const [loaded, setLoaded] = useState(false);
  return <div className="watch-player">{loaded ? <iframe src={`https://www.youtube-nocookie.com/embed/${message.id}?playsinline=1&rel=0`} title={message.youtubeTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button type="button" className="watch-player-cover" onClick={() => setLoaded(true)} aria-label={`Load video: ${message.title}`}><img src={messageThumbnail(message)} alt="" width="480" height="360" /><span className="watch-play"><Play size={30} fill="currentColor" /></span><span className="watch-player-label">Open video player <span>{message.duration}</span></span></button>}</div>;
}

export default function Watch() {
  const { slug } = useParams();
  const message = slug ? channelMessage(slug) : CHANNEL_MESSAGES[0];
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ slug: string; text: string } | null>(null);
  const [shared, setShared] = useState('');
  const { draft, setDraft } = useDraft();
  const navigate = useNavigate();
  if (!message) return <div className="elroi-site"><Nav /><main id="main-content" className="elroi-product-main"><h1>Let’s find a message for you.</h1><p>This message is not in our collection.</p><Link className="elroi-button elroi-button-dark" to="/watch/">See all messages <ArrowRight size={18} /></Link></main><Footer /></div>;
  const reflection = reflections[message.slug] || '';
  const shareUrl = `https://elroicall.com${messagePath(message)}`;
  function discuss() {
    if (!message) return;
    const next = messageConversationDraft(message, reflection, draft);
    if (next === null) {
      setNotice({ slug: message.slug, text: 'Your earlier conversation draft and this reflection together exceed 2,000 characters. Shorten this reflection, or open your earlier draft to review it first.' });
      return;
    }
    setDraft(next);
    navigate('/begin/');
  }
  async function copyLink() {
    if (!message) return;
    try { await navigator.clipboard.writeText(shareUrl); setShared(message.slug); }
    catch { setShared(`manual:${message.slug}`); }
  }
  return <div className="elroi-site watch-page"><Nav /><main id="main-content">
    <header className="watch-intro elroi-container"><Link className="watch-text-link" to="/"><ArrowLeft size={16} /> Home</Link><div className="watch-intro-line"><div><p className="watch-eyebrow">WATCH. REFLECT. TALK.</p><h1>A message for<br /><em>this moment.</em></h1></div><div className="watch-channel-note"><Youtube size={25} /><p>From our El Roi Calls channel.<br />A little space to listen, then go deeper.</p><a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Explore the channel <ArrowUpRight size={16} /></a></div></div></header>
    <section className="watch-feature elroi-container" aria-labelledby="message-heading"><div><VideoPlayer key={message.id} message={message} /><div className="watch-player-meta"><span>EL ROI CALLS · {message.duration}</span><a href={youtubeVideoUrl(message)} target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={15} /></a></div></div><div className="watch-feature-copy"><p className="watch-eyebrow">{message.category}</p><h2 id="message-heading">{message.title}</h2><p>{message.summary}</p><a href="#your-reflection" className="watch-feature-action">What does this bring up for you? <ArrowRight size={18} /></a><div className="watch-share"><button type="button" onClick={() => void copyLink()}>{shared === message.slug ? <Check size={16} /> : <Copy size={16} />}{shared === message.slug ? 'Link copied' : 'Share this reflection'}</button><span role="status">{shared === message.slug ? 'Only the public page link is copied.' : ''}</span>{shared === `manual:${message.slug}` && <label>Copy this page link<input readOnly value={shareUrl} onFocus={event => event.target.select()} /></label>}</div></div></section>
    <section className="watch-reflect elroi-container" aria-labelledby="reflection-heading"><div className="watch-scripture"><p className="watch-eyebrow"><BookOpen size={17} /> A MOMENT IN SCRIPTURE</p><blockquote>“{message.verse}”</blockquote><p className="watch-verse-reference">{message.passage} · King James Version</p><a className="watch-text-link" href={readingPassageUrl(message.passage)} target="_blank" rel="noopener noreferrer">Read in context <ArrowUpRight size={16} /></a><div className="watch-companion"><h3>A thought to sit with.</h3><p>{message.reflection}</p></div></div><div className="watch-reflection" id="your-reflection"><p className="watch-eyebrow">BRING IT INTO YOUR LIFE</p><h2 id="reflection-heading">{message.question}</h2><label htmlFor="watch-reflection">Your reflection <span>(optional)</span></label><textarea id="watch-reflection" rows={4} maxLength={1200} placeholder="A thought, a question, a prayer…" value={reflection} onChange={event => { setReflections(previous => ({ ...previous, [message.slug]: event.target.value })); setNotice(null); }} /><p className="watch-draft-note">A draft for this visit. You can review it before sharing in a conversation.</p><button className="elroi-button elroi-button-primary" type="button" onClick={discuss}>Discuss this message with El Roi <MessageCircle size={18} /></button>{notice?.slug === message.slug && <p role="alert" className="watch-error">{notice.text} <Link to="/begin/">Review earlier draft</Link></p>}<Link className="watch-text-link" to={messageScheduleUrl(message)}>Explore a call time for {message.passage} <ArrowRight size={16} /></Link><Link className="watch-notes-link" to="/account/?view=notes">Open my saved notes</Link></div></section>
    <section className="watch-library elroi-container" aria-labelledby="library-heading"><div className="watch-library-heading"><div><p className="watch-eyebrow">MAKE A LITTLE ROOM</p><h2 id="library-heading">Find what meets you here.</h2></div><a className="watch-text-link" href={`${YOUTUBE_CHANNEL_URL}/videos`} target="_blank" rel="noopener noreferrer">More on YouTube <ArrowUpRight size={17} /></a></div><div className="watch-message-grid">{CHANNEL_MESSAGES.map(item => <Link to={messagePath(item)} key={item.id} className="watch-message-card" aria-current={item.id === message.id ? 'page' : undefined}><div className="watch-message-image"><img src={messageThumbnail(item)} alt="" loading="lazy" width="480" height="360" /><span className="watch-card-play"><Play size={19} fill="currentColor" /></span><span className="watch-duration">{item.duration}</span></div><div className="watch-message-copy"><span>{item.category}</span><h3>{item.title}</h3><p>{item.passage}<ArrowRight size={17} /></p></div></Link>)}</div></section>
    <section className="watch-close elroi-container"><Youtube size={26} /><div><h2>A place to return to.</h2><p>Find more prayers and biblical reflections on our channel. El Roi is here when you want to talk.</p></div><a className="elroi-button elroi-button-dark" href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Visit El Roi Calls <ArrowUpRight size={17} /></a></section>
  </main><Footer /></div>;
}
