import type { ReactNode } from "react";
import { ArrowLeft, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

type ProductShellProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  compact?: boolean;
};

export default function ProductShell({
  children,
  backHref = "/",
  backLabel = "Home",
  eyebrow,
  title,
  description,
  compact = false,
}: ProductShellProps) {
  return (
    <div className="night-band min-h-screen bg-[#0b0b0d] text-parchment">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,hsl(var(--gold-bright)/0.13),transparent_72%)]" />
      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="font-serif-display text-xl font-medium tracking-wide text-parchment">
            El Roi <span className="italic text-gold-bright">Call</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={backHref}
              className="hidden items-center gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-parchment-dim transition-colors hover:text-gold-bright sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </a>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 border border-gold-soft px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-bright transition-colors hover:bg-[hsl(var(--gold))] hover:text-[#17120a]"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </header>

      <main className={`relative z-10 mx-auto w-full px-6 ${compact ? "max-w-3xl py-12 sm:py-16" : "max-w-5xl py-14 sm:py-20"}`}>
        {(eyebrow || title || description) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h1 className="font-serif-display mt-5 text-4xl font-light leading-[1.05] tracking-tight text-parchment sm:text-6xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-5 max-w-2xl text-[15px] font-light leading-[1.85] text-parchment-dim sm:text-base">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/8 px-6 py-8 text-center text-[11px] font-light leading-relaxed text-parchment-dim">
        AI-guided biblical reflection for adults 18+. Not therapy, clergy, medical care, or crisis support.
        <span className="mx-2">·</span>
        <a href="/privacy/" className="hover:text-gold-bright">Privacy</a>
        <span className="mx-2">·</span>
        <a href="/terms/" className="hover:text-gold-bright">Terms</a>
      </footer>
    </div>
  );
}
