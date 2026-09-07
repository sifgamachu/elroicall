import { useEffect, useState } from "react";
import { ArrowRight, DoorOpen } from "lucide-react";

const links = [
  { label: "How it goes", href: "#descent" },
  { label: "Stories", href: "#stories" },
  { label: "Return", href: "#return" },
  { label: "Gift", href: "#gift" },
  { label: "Questions", href: "#questions" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[#c7a35b]/20 bg-[#0b0a08]/94 shadow-[0_10px_36px_-28px_rgba(0,0,0,.85)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-baseline gap-2" aria-label="El Roi Call home">
          <span className="font-serif-display text-xl font-medium tracking-wide text-[#f2eadb]">
            El Roi <span className="italic text-[#d0aa62]">Call</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#9e927f] transition-colors hover:text-[#dfbd73]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/account/" className="group inline-flex items-center gap-2 px-2.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#9e927f] transition-colors hover:text-[#dfbd73]">
            <DoorOpen className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Your Room</span>
          </a>
          <a href="/begin/" className="group inline-flex items-center gap-2 bg-[#d1aa60] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#17120b] transition-all hover:bg-[#e2c178] sm:px-5">
            <span className="hidden sm:inline">Tell me what happened</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
