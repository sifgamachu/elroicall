import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Menu, Phone, ArrowUpRight } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/phone';
import { useSeason } from '@/lib/seasonal-context';
import ProductShell from '@/components/ProductShell';
import '@/autumn.css';

export function AutumnNav() {
  return <header className="autumn-nav"><a className="autumn-skip" href="#main-content">Skip to content</a><div className="autumn-width autumn-nav-inner">
    <Link className="autumn-brand" to="/" aria-label="ElroiCall home">elroicall</Link>
    <nav className="autumn-desktop-nav" aria-label="Main navigation"><Link to="/">ElroiCall services</Link><Link to="/journey/">Bible readings</Link><Link to="/begin/">Start a conversation</Link><Link to="/account/?mode=signin">Sign in</Link><Link className="autumn-button" to="/schedule/">Schedule a call</Link></nav>
    <Sheet><SheetTrigger asChild><button className="autumn-menu" aria-label="Open navigation" type="button"><Menu /></button></SheetTrigger><SheetContent className="autumn-sheet"><SheetHeader><SheetTitle>elroicall</SheetTitle><SheetDescription>Your journey through Scripture.</SheetDescription></SheetHeader><nav aria-label="Mobile navigation">{[['ElroiCall services','/'],['Start a conversation','/begin/'],['The journey','/journey/'],['Daily readings','/journey/1/'],['Explore Scripture','/explore/'],['Schedule a call','/schedule/'],['Sign in','/account/?mode=signin'],['Create account','/signup/']].map(([label,to])=><SheetClose key={to} asChild><Link to={to}>{label}<ArrowUpRight size={17}/></Link></SheetClose>)}</nav></SheetContent></Sheet>
  </div></header>;
}
export default function AutumnShell({children,home=false}:{children:ReactNode;home?:boolean}) {
  const season = useSeason();
  if (!season) return <ProductShell><div className="autumn-site journey-evergreen" data-season="evergreen">{children}</div></ProductShell>;
  return <div className={`autumn-site${home?' autumn-home':''}`}><AutumnNav/><main id="main-content">{children}</main><footer className="autumn-footer autumn-width"><div><Link className="autumn-brand" to="/">elroicall</Link><p>The God who sees you. Scripture for real life.</p></div><nav aria-label="Footer navigation"><Link to="/explore/">Scripture library</Link><Link to="/begin/">Start a conversation</Link><Link to="/gift/">Gift a call</Link><Link to="/account/">Your room</Link><Link to="/about/">About</Link><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav><a href={PHONE_TEL} className="autumn-phone"><Phone size={17}/>{PHONE_DISPLAY}</a><p className="autumn-fineprint">© 2026 El Roi Call · A product of Teregna LLC. AI-guided biblical reflection for adults 18+. Calls are recorded under the current Privacy Policy. El Roi Call is not clergy, therapy, medical care, or crisis support.</p></footer></div>;
}
