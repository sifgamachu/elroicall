import { ArrowRight, ArrowUpRight, BookOpen, Check, Heart, LockKeyhole, Phone } from "lucide-react";
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
          <p className="elroi-pill"><BookOpen size={15} /> AI-guided biblical reflection</p>
          <h1>A little space.<br /><span>A deeper<br className="elroi-desktop-break" /> conversation.</span></h1>
          <p className="elroi-hero-description">Bring your questions, your worries, your real life. Find room to reflect with an AI guide and explore what Scripture brings to the conversation.</p>
          <div className="elroi-hero-actions"><a href={PHONE_TEL} className="elroi-button elroi-button-primary"><Phone size={18} /> Call El Roi<ArrowUpRight size={17} /></a><a href="#first-words" className="elroi-text-link">Start with a few words<ArrowRight size={17} /></a></div>
          <Link to="/schedule/" className="elroi-text-link" style={{ marginTop: 18 }}>Prefer a regular time? Schedule a call<ArrowRight size={16} /></Link>
          <p className="elroi-free-note"><Check size={15} /> First call free <span>·</span> No card needed</p>
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
