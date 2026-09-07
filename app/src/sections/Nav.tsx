import { useEffect, useState } from "react";
import { ArrowRight, DoorOpen } from "lucide-react";

const links = [
  { label: "Stories", href: "#witnesses" },
  { label: "How It Works", href: "#how" },
  { label: "The Well", href: "#well" },
  { label: "Membership", href: "#membership" },
  { label: "Questions", href: "#questions" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brandClass = scrolled ? "text-[#211b13]" : "text-parchment";
  const linkClass = scrolled
    ? "text-[#655b4b] hover:text-[#8d6e27]"
    : "text-parchment-dim hover:text-gold-bright";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[#cbbd9a]/55 bg-[#f7f1e4]/92 shadow-[0_8px_30px_-24px_rgba(0,0,0,.55)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-baseline gap-2" aria-label="El Roi Call home">
          <span className={`font-serif-display text-xl font-medium tracking-wide transition-colors ${brandClass}`}>
            El Roi <span className="italic text-[#b78f35]">Call</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${linkClass}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/account/"
            className={`group inline-flex items-center gap-2 px-2.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors ${linkClass}`}
          >
            <DoorOpen className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Your Room</span>
          </a>
          <a
            href="/begin/"
            className="group inline-flex items-center gap-2 bg-[#b78f35] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#fffaf0] transition-all hover:bg-[#946f22] sm:px-5"
          >
            <span className="hidden sm:inline">Start free</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
