import { ArrowUpRight } from "lucide-react";

const STORIES = [
  { name: "Hagar", need: "unseen", line: "When you feel overlooked, used, displaced, or forgotten.", ref: "Genesis 16; 21" },
  { name: "Job", need: "grief", line: "When grief does not fit inside easy explanations.", ref: "Job 1–42" },
  { name: "Esther", need: "fear", line: "When courage has consequences and silence has consequences too.", ref: "Esther 1–10" },
  { name: "Peter", need: "shame", line: "When one failure has started to feel like your whole identity.", ref: "Luke 22; John 21" },
  { name: "Elijah", need: "burnout", line: "When strength runs out after you have been strong for too long.", ref: "1 Kings 18–19" },
  { name: "Hannah", need: "unanswered", line: "When longing becomes a private language between you and God.", ref: "1 Samuel 1–2" },
  { name: "Ruth", need: "starting-over", line: "When the life you knew is gone and you still have to move forward.", ref: "Ruth 1–4" },
  { name: "Moses", need: "unqualified", line: "When the assignment in front of you feels bigger than your confidence.", ref: "Exodus 3–4" },
  { name: "Joseph", need: "betrayal", line: "When harm came through people who were supposed to be close to you.", ref: "Genesis 37–50" },
  { name: "Nehemiah", need: "calling", line: "When grief over what is broken becomes responsibility to rebuild.", ref: "Nehemiah 1–6" },
];

export default function StoryShelf() {
  return (
    <section id="stories" className="bg-[#15120e] px-6 py-24 text-[#efe7d8] lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#d0aa62]">Stories we know deeply</p>
            <h2 className="font-serif-display mt-5 text-5xl font-light leading-[0.95] sm:text-6xl">
              Fewer stories.
              <span className="block italic text-[#dfbd77]">Much more depth.</span>
            </h2>
          </div>
          <p className="max-w-2xl text-sm font-light leading-[1.85] text-[#a99d89] lg:justify-self-end">
            El Roi does not need a giant cast of synthetic Bible personalities. It needs a smaller library of carefully reviewed stories that can be opened with context, honesty, questions, and prayer.
          </p>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-5">
          {STORIES.map((story, index) => (
            <a
              key={story.name}
              href={`/begin/?need=${story.need}`}
              className="group relative min-h-[17rem] bg-[#15120e] p-5 transition-colors hover:bg-[#1d1811]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#766b59]">{String(index + 1).padStart(2, "0")}</span>
                <ArrowUpRight className="h-4 w-4 text-[#806d4a] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ddb96f]" />
              </div>
              <h3 className="font-serif-display mt-10 text-3xl font-light italic text-[#f0e7d7] transition-colors group-hover:text-[#e0bd75]">{story.name}</h3>
              <p className="mt-4 text-[12px] font-light leading-[1.75] text-[#a59a88]">{story.line}</p>
              <p className="absolute bottom-5 left-5 text-[9px] font-medium uppercase tracking-[0.2em] text-[#6f6555]">{story.ref}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-l border-[#c79e54]/50 pl-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif-display text-xl font-light italic text-[#d8cdb9]">Scripture is not decoration around the AI. It is the source material the conversation has to respect.</p>
          <a href="/about/" className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#cba65f] hover:text-[#e2c27e]">Why El Roi exists</a>
        </div>
      </div>
    </section>
  );
}
