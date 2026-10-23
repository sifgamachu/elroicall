import { ArrowUpRight, Gift, Heart, ListChecks, Shuffle } from 'lucide-react';
import { HATPULL_HOME_URL } from '@/lib/hatpull';
import '@/secret-santa-promotion.css';

export default function SecretSantaPromotion() {
  return (
    <aside className="elroi-container elroi-secret-santa" aria-labelledby="secret-santa-title">
      <div className="elroi-secret-santa-mark" aria-hidden="true">
        <Gift size={40} strokeWidth={1.5} />
      </div>
      <div className="elroi-secret-santa-copy">
        <p className="elroi-kicker">A LITTLE JOY TO SHARE · HATPULL</p>
        <h2 id="secret-santa-title">Secret Santa Gift Exchange</h2>
        <p>Bring your family, friends, church group, or coworkers together. Set a budget, draw names privately, and share wishlists for a thoughtful gift exchange.</p>
        <ul aria-label="Gift exchange features">
          <li><Shuffle size={16} aria-hidden="true" /> Private name draws</li>
          <li><Heart size={16} aria-hidden="true" /> Your group’s budget</li>
          <li><ListChecks size={16} aria-hidden="true" /> Personal wishlists</li>
        </ul>
      </div>
      <div className="elroi-secret-santa-action">
        <a className="elroi-button" href={HATPULL_HOME_URL} target="_blank" rel="noopener noreferrer">
          Start your Secret Santa <ArrowUpRight size={18} aria-hidden="true" />
          <span className="sr-only"> (opens Hatpull in a new tab)</span>
        </a>
        <p>Free to organize · Opens Hatpull</p>
        <p>Another tool from Teregna LLC</p>
      </div>
    </aside>
  );
}
