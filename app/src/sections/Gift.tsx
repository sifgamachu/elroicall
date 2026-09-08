import { ArrowUpRight, Gift } from "lucide-react";
import { Link } from "react-router";

export default function GiftSection() {
  return <section id="gift" className="elroi-gift-section"><div className="elroi-container"><div className="elroi-gift-banner"><div className="elroi-gift-copy"><p className="elroi-kicker"><Gift size={18} /> A SMALL WAY TO SHOW UP</p><h2>Give someone<br />room to talk.</h2><p>Send a private invitation to a free El Roi conversation. They choose when to use it, what to share, and where to begin.</p></div><div className="elroi-gift-action"><Link to="/gift/" className="elroi-button elroi-button-white">Gift a conversation<ArrowUpRight size={18} /></Link><span>One free call. A thoughtful gesture.</span></div></div></div></section>;
}
