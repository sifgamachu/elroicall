import { ArrowUpRight, BookOpen } from "lucide-react";
import { Link } from "react-router";

const STORIES = [
  { name: "Hagar", need: "unseen", line: "When you feel overlooked, used, displaced, or forgotten.", ref: "Genesis 16; 21" },
  { name: "Job", need: "grief", line: "When grief does not fit inside easy explanations.", ref: "Job 1–42" },
  { name: "Esther", need: "fear", line: "When courage has consequences and silence has consequences too.", ref: "Esther 1–10" },
  { name: "Peter", need: "shame", line: "When one failure has started to feel like your whole identity.", ref: "Luke 22; John 21" },
  { name: "Elijah", need: "burnout", line: "When strength runs out after you have been strong for too long.", ref: "1 Kings 18–19" },
  { name: "Hannah", need: "unanswered", line: "When longing becomes a private language between you and God.", ref: "1 Samuel 1–2" },
  { name: "Ruth", need: "starting-over", line: "When the life you knew is gone and you still have to move forward.", ref: "Ruth 1–4" },
  { name: "Moses", need: "unqualified", line: "When the assignment in front of you feels bigger than your confidence.", ref: "Exodus 3–4" },
  { name: "Joseph", need: "betrayal", line: "When harm came through people who were supposed to be close to you.", ref: "Genesis 37–50" },
  { name: "Nehemiah", need: "calling", line: "When grief over what is broken becomes responsibility to rebuild.", ref: "Nehemiah 1–6" },
];

export default function StoryShelf() {
  return <section id="stories" className="elroi-section elroi-stories"><div className="elroi-container">
    <div className="elroi-section-heading"><div><p className="elroi-kicker">SCRIPTURE FOR REAL LIFE</p><h2>Find a starting point.</h2></div><p>Different lives. Familiar questions.<br />Explore the story behind what you are carrying.</p></div>
    <div className="elroi-story-grid">{STORIES.map((story,index) => <Link key={story.name} to={`/begin/?need=${story.need}`} className={`elroi-story-card elroi-story-${index % 5}`}><div className="elroi-story-top"><BookOpen size={20} /><ArrowUpRight size={18} /></div><h3>{story.name}</h3><p>{story.line}</p><span>{story.ref}</span></Link>)}</div>
    <div className="elroi-story-note"><p>One AI guide. Many ways into Scripture.</p><Link to="/about/">Meet the idea behind El Roi<ArrowUpRight size={17} /></Link></div>
  </div></section>;
}
