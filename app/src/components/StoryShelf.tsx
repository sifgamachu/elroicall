import { ArrowUpRight, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { SCRIPTURE_MOMENTS } from "@/lib/scripture-library";



export default function StoryShelf() {
  return <section id="stories" className="elroi-section elroi-stories"><div className="elroi-container">
    <div className="elroi-section-heading"><div><p className="elroi-kicker">SCRIPTURE FOR REAL LIFE</p><h2>Find a starting point.</h2></div><p>Read the story. Reflect on a question.<br />Every reading is free to open.</p></div>
    <div className="elroi-story-grid">{SCRIPTURE_MOMENTS.map((story,index) => <Link key={story.id} to={`/explore/${story.id}/`} className={`elroi-story-card elroi-story-${index % 5}`}><div className="elroi-story-top"><BookOpen size={20} /><ArrowUpRight size={18} /></div><h3>{story.person}</h3><p>{story.description}</p><span>{story.passage}</span></Link>)}</div>
    <div className="elroi-story-note"><p>Ten short reflections. A place to start today.</p><Link to="/explore/">Open the Scripture library<ArrowUpRight size={17} /></Link></div>
  </div></section>;
}
