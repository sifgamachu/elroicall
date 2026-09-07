import { ArrowRight, BookOpenText, Eye, RotateCcw, Waves } from "lucide-react";

const LEVELS = [
  {
    number: "01",
    label: "Surface",
    title: "Say what is true before anyone tries to fix it.",
    body: "A person should not have to understand El Roi before using it. The first job is simply to create enough room for an honest sentence.",
    quote: "I keep telling everyone I'm okay because I don't want to become the sad person in the room.",
    icon: Waves,
  },
  {
    number: "02",
    label: "Seen",
    title: "Understanding comes before explanation.",
    body: "El Roi reflects the emotional thread back first. No instant lesson. No spiritual cliché. No rushing to make pain meaningful.",
    quote: "It sounds like people are trying to comfort you by explaining the loss, but you may need room to grieve before anyone explains it.",
    icon: Eye,
  },
  {
    number: "03",
    label: "Scripture",
    title: "A biblical story enters only when it actually belongs.",
    body: "The story is not a character performance. It becomes a lens: text, tension, questions, context, and prayer brought into the person's real life.",
    quote: "There is a story I want to sit with—not because it explains your loss, but because Scripture lets grief speak without pretending it is small.",
    icon: BookOpenText,
  },
  {
    number: "04",
    label: "Return",
    title: "The next visit should feel like a continuation, not a restart.",
    body: "The relationship is built through continuity. A member can return to the same thread, say something changed, or bring something completely different.",
    quote: "Last time, we were sitting with Job and the anger you had not been able to say out loud. Where are you today?",
    icon: RotateCcw,
  },
];

export default function DescentExperience() {
  return (
    <section id="descent" className="relative overflow-hidden bg-[#f3ecdd] text-[#2a241b]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(144,116,65,.08)_1px,transparent_1px),linear-gradient(rgba(144,116,65,.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-10 lg:py-32">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#9b742d]">The architecture of a conversation</p>
          <h2 className="font-serif-display mt-5 text-5xl font-light leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            The deeper you go,
            <span className="block italic text-[#9a7636]">the less the product should get in the way.</span>
          </h2>
          <p className="mt-7 max-w-md text-sm font-light leading-[1.85] text-[#736754] sm:text-base">
            El Roi is designed like a well: a clear entrance, depth, a meeting place, and something worth carrying back to the surface.
          </p>

          <div className="relative mt-12 hidden h-[30rem] lg:block">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#b88d42]/20 via-[#b88d42]/70 to-[#342a1d]" />
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="absolute left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border border-[#a6813e]/30"
                style={{ top: `${index * 24}%`, transform: `translateX(-50%) scale(${1 + index * 0.34})` }}
              />
            ))}
            <div className="absolute bottom-4 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full border border-[#8c6a2e]/45 bg-[radial-gradient(circle,rgba(88,68,37,.2),rgba(88,68,37,.03)_55%,transparent_70%)] shadow-[0_28px_70px_rgba(68,50,28,.16)]" />
          </div>
        </aside>

        <div className="relative">
          <div className="absolute left-4 top-8 hidden h-[calc(100%-4rem)] w-px bg-[#aa8648]/25 sm:block" />
          <div className="space-y-5 sm:pl-12">
            {LEVELS.map((level, index) => {
              const Icon = level.icon;
              return (
                <article
                  key={level.number}
                  className="group relative border border-[#b8a178]/35 bg-[#faf6ed]/80 p-6 shadow-[0_18px_55px_-42px_rgba(48,36,21,.45)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#9e7a3a]/55 sm:p-8 lg:min-h-[22rem]"
                >
                  <div className="absolute -left-[3.45rem] top-9 hidden h-7 w-7 place-items-center rounded-full border border-[#a47d38]/45 bg-[#f3ecdd] text-[9px] font-semibold text-[#8f6b31] sm:grid">
                    {index + 1}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#99722d]">{level.number} · {level.label}</span>
                    </div>
                    <Icon className="h-5 w-5 text-[#a27a35]" />
                  </div>
                  <h3 className="font-serif-display mt-5 max-w-2xl text-3xl font-light leading-[1.08] sm:text-4xl">{level.title}</h3>
                  <p className="mt-5 max-w-2xl text-[13px] font-light leading-[1.85] text-[#746957] sm:text-sm">{level.body}</p>
                  <blockquote className="font-serif-display mt-7 max-w-2xl border-l border-[#b48b43]/55 pl-5 text-xl font-light italic leading-[1.6] text-[#4d4030] sm:text-2xl">
                    “{level.quote}”
                  </blockquote>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#b6a27f]/35 px-6 py-14 text-center">
        <p className="font-serif-display text-2xl font-light italic text-[#5e503e]">The product is not the destination. The conversation is.</p>
        <a href="/begin/" className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8e6727] hover:text-[#684714]">
          Start at the surface <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
