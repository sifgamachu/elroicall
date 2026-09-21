import { ArrowRight, ArrowUpRight, BookOpen, CalendarClock, Check, Heart, LockKeyhole, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PHONE_TEL } from "@/lib/phone";
import { useDraft } from "@/lib/draft";

const NEEDS = [
  { label: "Feeling overwhelmed", value: "burnout" },
  { label: "Looking for direction", value: "calling" },
  { label: "Carrying a loss", value: "grief" },
];

export default function WellEntry() {
  const navigate = useNavigate();
  const { draft, setDraft } = useDraft();
  const continueWithDraft = () => { if (draft.trim()) navigate("/begin/"); };
  return (
    <section id="top" className="elroi-hero">
      <div className="elroi-container elroi-hero-grid">
        <div className="elroi-hero-copy">
          <p className="elroi-pill"><BookOpen size={15} /> Personalized Scripture, by phone</p>
          <h1>Bible encouragement.<br /><span>Delivered at<br className="elroi-desktop-break" /> your time.</span></h1>
          <p className="elroi-hero-description">Choose a Bible study, short sermon, biblical story, lecture, or Bible facts. Pick your time, voice, and call length. El Roi calls you.</p>
          <div className="elroi-hero-actions"><Link to="/schedule/?source=home_hero" className="elroi-button elroi-button-primary"><CalendarClock size={18} /> Schedule my first free call<ArrowRight size={17} /></Link><a href={PHONE_TEL} className="elroi-text-link"><Phone size={18} /> Call now<ArrowUpRight size={17} /></a></div>
          <Link to="/explore/?source=home_hero" className="elroi-text-link elroi-hero-reading-link"><BookOpen size={17} /> Try a free 3-minute reflection<ArrowRight size={16} /></Link>
          <p className="elroi-free-note"><Check size={15} /> First call free <span>·</span> No card needed <span>·</span> Scripture cited</p>
          <div className="elroi-verse"><span className="elroi-verse-line" /><div><p>“You are the God who sees me.”</p><span>Genesis 16:13 · The heart behind El Roi</span></div></div>
        </div>
        <div className="elroi-entry" id="first-words">
          <div className="elroi-entry-art"><img src="/images/elroi-light.webp" alt="" width="1536" height="1024" fetchPriority="high" /><div className="elroi-entry-label"><Heart size={15} /> A moment for you</div></div>
          <form className="elroi-composer" onSubmit={event => { event.preventDefault(); continueWithDraft(); }}>
            <div className="elroi-composer-heading"><label htmlFor="well-draft">What’s on your heart?</label><LockKeyhole size={17} aria-label="Draft stays in this tab" /></div>
            <textarea id="well-draft" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); continueWithDraft(); } }} rows={3} maxLength={2000} placeholder="You can start anywhere…" aria-describedby="draft-privacy" />
            <button type="submit" disabled={!draft.trim()} className="elroi-button elroi-button-primary elroi-composer-submit">Continue with my words<ArrowRight size={18} /></button>
            <p id="draft-privacy" className="elroi-small">Your words stay in this tab until you review and consent to sharing. Refreshing clears your draft.</p>
          </form>
          <div className="elroi-starters"><p>Need a starting point?</p><div>{NEEDS.map(need => <button key={need.value} type="button" onClick={() => navigate(`/begin/?need=${need.value}`)}>{need.label}<ArrowUpRight size={14} /></button>)}</div></div>
        </div>
      </div>
      <div className="elroi-container elroi-trust-strip"><span><BookOpen size={17} /> Rooted in Scripture</span><span><Heart size={17} /> One consistent AI guide</span><span><LockKeyhole size={17} /> You choose what to share</span></div>
    </section>
  );
}
