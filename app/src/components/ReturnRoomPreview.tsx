import { ArrowRight, Check, CircleOff, RotateCcw } from "lucide-react";

export default function ReturnRoomPreview() {
  return (
    <section id="return" className="relative overflow-hidden bg-[#ece2cf] px-6 py-24 text-[#2c251b] lg:px-10 lg:py-32">
      <div className="pointer-events-none absolute -right-40 top-10 h-[38rem] w-[38rem] rounded-full border border-[#a57e37]/10" />
      <div className="pointer-events-none absolute -right-8 top-36 h-[25rem] w-[25rem] rounded-full border border-[#a57e37]/15" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-20">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#98702d]">The reason to return</p>
          <h2 className="font-serif-display mt-5 text-5xl font-light leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            Don't make me
            <span className="block italic text-[#98743a]">start over.</span>
          </h2>
          <p className="mt-7 max-w-lg text-sm font-light leading-[1.9] text-[#716654] sm:text-base">
            A meaningful second visit should feel different from a first visit. El Roi should remember only what the person has chosen to carry forward—and make that memory visible rather than mysterious.
          </p>
          <div className="mt-8 space-y-3 text-[12px] font-light leading-relaxed text-[#655b4b]">
            <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#98702d]" />Continue the same thread without re-explaining everything.</p>
            <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#98702d]" />Say something changed and let the old context step back.</p>
            <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#98702d]" />See what is remembered and decide what should not be remembered.</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 border border-[#aa884d]/15" />
          <article className="relative border border-[#aa884d]/40 bg-[#f8f1e5] p-6 shadow-[0_35px_80px_-50px_rgba(65,47,24,.45)] sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-[#c5b18e]/45 pb-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9b742f]">Your Room · example</p>
                <h3 className="font-serif-display mt-2 text-3xl font-light">Welcome back, Sarah.</h3>
              </div>
              <RotateCcw className="h-5 w-5 text-[#a07937]" />
            </div>

            <div className="mt-6 border-l-2 border-[#b78d44] pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#98702d]">Last thread</p>
              <p className="font-serif-display mt-3 text-2xl font-light italic leading-[1.45] text-[#493d2e]">
                “Last time we were sitting with Job and the anger you had not been able to say out loud after your mother's death.”
              </p>
              <p className="mt-4 text-[12px] font-light leading-relaxed text-[#766957]">Where are you today?</p>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <button type="button" className="border border-[#9e7939]/45 bg-[#a67d36] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fff9ee]">Continue there</button>
              <button type="button" className="border border-[#bca780]/60 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6a5637]">Something changed</button>
              <button type="button" className="border border-[#bca780]/60 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6a5637]">Something else</button>
            </div>

            <div className="mt-8 border-t border-[#c5b18e]/45 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#98702d]">What El Roi remembers</p>
                  <p className="mt-1 text-[11px] font-light text-[#7b6f5d]">A design target—memory controls ship only when backend behavior is verified.</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  "My mother died earlier this year.",
                  "I asked to keep exploring Job.",
                  "I prefer questions before prayer.",
                ].map((memory) => (
                  <div key={memory} className="flex items-center justify-between gap-4 border border-[#cbb994]/50 bg-[#fbf6ed] px-4 py-3 text-[12px] font-light text-[#5d5141]">
                    <span>{memory}</span>
                    <button type="button" aria-label={`Do not remember: ${memory}`} className="text-[#95846c] hover:text-[#7d5c26]"><CircleOff className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <a href="/account/" className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8b6528] hover:text-[#694612]">
            Enter Your Room <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
