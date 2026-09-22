import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router';

export default function SeasonalPromotion() {
  return <aside className="elroi-container elroi-seasonal-promotion" aria-labelledby="seasonal-promotion-title">
    <div><p className="elroi-kicker"><BookOpen size={16}/>OCTOBER–DECEMBER · AN OPTIONAL BIBLE CHALLENGE</p><h2 id="seasonal-promotion-title">This season, read the whole story.</h2><p>84 reading days, simple guides, and room to reflect. Join at your pace alongside your usual ElroiCall conversations.</p></div>
    <Link className="elroi-button elroi-button-primary" to="/bible-challenge/">Explore the Bible challenge <ArrowRight size={17}/></Link>
  </aside>;
}
