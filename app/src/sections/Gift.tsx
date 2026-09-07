import { Gift as GiftIcon, ArrowRight } from "lucide-react";

export default function Gift() {
  return (
    <section id="gift" className="relative overflow-hidden bg-[#0e0c09] px-6 py-24 text-[#f0e8d9] lg:px-10 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-px bg-gradient-to-b from-[#c8a35a]/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 border border-white/[0.08] bg-[#13100c] p-7 sm:p-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:p-14">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d0aa62]">
            <GiftIcon className="h-4 w-4" />
            Give someone a place to start
          </div>
          <h2 className="font-serif-display mt-6 text-5xl font-light leading-[0.96] sm:text-6xl">
            Sometimes love
            <span className="block italic text-[#dfbd76]">runs out of words.</span>
          </h2>
        </div>

        <div>
          <p className="max-w-2xl text-sm font-light leading-[1.9] text-[#aa9e8a] sm:text-base">
            You do not have to diagnose what someone needs or choose a Bible story for them. You can simply give them one free El Roi conversation and let them decide whether to open it, what to talk about, and whether they want to call.
          </p>
          <blockquote className="font-serif-display mt-6 border-l border-[#c39a51]/60 pl-5 text-xl font-light italic leading-[1.6] text-[#d9cdb9]">
            “I don't know what to say to make this easier. I just wanted you to have somewhere to talk. No pressure to use it.”
          </blockquote>
          <a href="/gift/" className="group mt-8 inline-flex items-center gap-3 bg-[#d0aa62] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#17120b] transition-colors hover:bg-[#e0c078]">
            Create a private gift <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
          <p className="mt-4 text-[10px] font-light leading-relaxed text-[#766d5e]">One free conversation · recipient controlled · no card required</p>
        </div>
      </div>
    </section>
  );
}
