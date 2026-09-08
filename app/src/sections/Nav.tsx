import { ArrowUpRight, Menu, Phone } from "lucide-react";
import { Link, useLocation } from "react-router";
import Brand from "@/components/Brand";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PHONE_TEL } from "@/lib/phone";

const links = [
  { label: "Schedule a call", href: "/schedule/" },
  { label: "Explore Scripture", href: "/#stories" },
  { label: "Gift a conversation", href: "/gift/" },
];

export default function Nav() {
  const { pathname } = useLocation();
  return (
    <header className="elroi-nav">
      <a href="#main-content" className="elroi-skip">Skip to content</a>
      <div className="elroi-container elroi-nav-inner">
        <Brand />
        <nav className="elroi-desktop-links" aria-label="Main navigation">
          {links.map(link => <Link key={link.href} to={link.href}>{link.label}</Link>)}
        </nav>
        <div className="elroi-nav-actions">
          <Link to="/account/" className="elroi-signin">Sign in</Link>
          <Link to="/begin/" className="elroi-button elroi-button-dark elroi-nav-start" aria-current={pathname.startsWith("/begin") ? "page" : undefined}>Begin <ArrowUpRight size={16} /></Link>
          <Sheet>
            <SheetTrigger asChild><button type="button" className="elroi-menu-button" aria-label="Open navigation"><Menu size={22} /></button></SheetTrigger>
            <SheetContent className="elroi-mobile-sheet">
              <SheetHeader><SheetTitle>El Roi Call</SheetTitle><SheetDescription>A little space for what is on your heart.</SheetDescription></SheetHeader>
              <nav aria-label="Mobile navigation" className="elroi-mobile-links">
                {links.map(link => <SheetClose asChild key={link.href}><Link to={link.href}>{link.label}<ArrowUpRight size={18} /></Link></SheetClose>)}
                <SheetClose asChild><Link to="/account/">Your room<ArrowUpRight size={18} /></Link></SheetClose>
                <SheetClose asChild><a href={PHONE_TEL}>Call El Roi<Phone size={18} /></a></SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
