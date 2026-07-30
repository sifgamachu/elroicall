import { useEffect, useState } from "react";
import { DoorOpen, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

const links = [
  { label: "The Voices", href: "#voices" },
  { label: "How It Works", href: "#how" },
  { label: "The Well", href: "#well" },
  { label: "Questions", href: "#questions" },
  { label: "Membership", href: "#membership" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-gold-faint bg-[#f7f1e4]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-serif-display text-xl font-medium tracking-wide text-parchment">
            El Roi <span className="italic text-gold-bright">Call</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-parchment-dim transition-colors hover:text-gold-bright"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/account/"
            className="group inline-flex items-center gap-2 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-parchment-dim transition-colors hover:text-gold-bright"
          >
            <DoorOpen className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:inline">Your Room</span>
            <span className="sm:hidden">Room</span>
          </a>
          <a
            href={PHONE_TEL}
            className="group inline-flex items-center gap-2.5 border border-gold-soft px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-bright transition-all hover:bg-[hsl(var(--gold))] hover:text-[#1a1409]"
          >
            <Phone className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
    </header>
  );
}
