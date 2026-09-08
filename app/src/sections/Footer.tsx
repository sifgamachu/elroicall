import { ArrowUpRight, Phone } from "lucide-react";
import { Link } from "react-router";
import Brand from "@/components/Brand";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

export default function Footer() {
  return <footer className="elroi-footer"><div className="elroi-container"><div className="elroi-footer-top"><div><Brand /><p>A little space for faith and real life.</p></div><a className="elroi-footer-phone" href={PHONE_TEL}><Phone size={19} /><span>{PHONE_DISPLAY}</span><ArrowUpRight size={19} /></a></div><div className="elroi-footer-bottom"><p>© 2026 El Roi Call · A product of Teregna LLC</p><nav aria-label="Footer navigation"><Link to="/about/">About</Link><Link to="/account/">Your room</Link><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></div><p className="elroi-disclosure">AI-guided biblical reflection for adults 18+. Not therapy, clergy, medical care, or crisis support. Calls are recorded under the current Privacy Policy. In the U.S., call or text 988 for crisis support, or 911 for an emergency.</p></div></footer>;
}
