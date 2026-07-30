import { useState } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Textarea } from "@/components/ui/textarea";
import { Flame } from "lucide-react";

const SB_URL = "https://mkocnufwmsfchivfbhuf.supabase.co";
const SB_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2NudWZ3bXNmY2hpdmZiaHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjcyNjUsImV4cCI6MjA5OTgwMzI2NX0.6SQI1J1ojAiKkfPzZZVh-3UyPlaaqv-Gxw4qYP9FPxs";

const TRACKS = [
  {
    guide: "Daily · One Year",
    title: "The Journey",
    body: "The whole Bible in one year — a daily call walking you through every one of the sixty-six books, Genesis to Revelation.",
  },
  {
    guide: "Daily · Every Chapter",
    title: "The Pulpit Walk",
    body: "A preached word each visit — straight through all 1,189 chapters of Scripture, one chapter at a time, nothing skipped.",
  },
  {
    guide: "Daily · A Check-In",
    title: "Inspiration",
    body: "A short daily visit — one story, one scripture, one charge for your day, and a prayer over it.",
  },
  {
    guide: "Daily · Unscripted",
    title: "The Surprise",
    body: "A different voice and a different word every time — the well decides what you need today.",
  },
];

function PrayerForm() {
  const [value, setValue] = useState("");
  const [placed, setPlaced] = useState<"well" | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const placeInWell = async () => {
    const request = value.trim().slice(0, 2000);
    if (!request || sending) return;
    setSending(true);
    setFailed(false);
    try {
      const r = await fetch(`${SB_URL}/rest/v1/prayer_requests`, {
        method: "POST",
        headers: {
          apikey: SB_ANON,
          Authorization: `Bearer ${SB_ANON}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ request, source: "web" }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setPlaced("well");
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  if (placed) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Flame className="h-6 w-6 text-gold" strokeWidth={1.25} />
        <p className="font-serif-display text-2xl italic text-parchment">
          It's in the well.
        </p>
        <p className="max-w-sm text-[13px] font-light leading-relaxed text-parchment-dim">
          Your request is held with no name and no number, lifted up for
          three days, then destroyed forever — as promised.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        placeInWell();
      }}
      className="flex flex-col gap-5"
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write your request here…"
        rows={5}
        className="resize-none rounded-none border-gold-faint bg-ink px-5 py-4 font-serif-display text-lg italic text-parchment placeholder:text-parchment-dim/50 focus-visible:ring-1 focus-visible:ring-[hsl(var(--gold))]"
      />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending || !value.trim()}
          className="bg-[hsl(var(--gold))] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1a1409] transition-all duration-300 hover:bg-[hsl(var(--gold-bright))] disabled:opacity-50"
        >
          {sending ? "Placing it…" : "Place It in the Well"}
        </button>
        {failed && (
          <p className="text-[12px] font-light text-parchment-dim">
            The well didn't receive it just now — please try once more.
          </p>
        )}
      </div>
    </form>
  );
}

export default function Well() {
  return (
    <section id="well" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="The Well · Beer Lahai Roi"
          title={
            <>
              The Journey —{" "}
              <span className="italic text-gold-bright">they call you</span>
            </>
          }
          copy="Choose a track and the house calls you — daily, at the hour you choose. Named for the well Hagar named: the well of the Living One who sees me."
        />

        <div className="mt-16 grid gap-px overflow-hidden border border-gold-faint bg-[hsl(var(--gold)/0.12)] sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.1} className="h-full">
              <article className="group flex h-full flex-col bg-ink p-8 transition-colors duration-500 hover:bg-ink-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                  {t.guide}
                </p>
                <h3 className="font-serif-display mt-4 text-2xl font-medium text-parchment">
                  {t.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] font-light leading-relaxed text-parchment-dim">
                  {t.body}
                </p>
                <span className="mt-6 block h-px w-8 bg-[hsl(var(--gold)/0.4)] transition-all duration-500 group-hover:w-16 group-hover:bg-[hsl(var(--gold))]" />
              </article>
            </Reveal>
          ))}
        </div>

        {/* prayer request */}
        <div className="mx-auto mt-20 max-w-2xl">
          <Reveal>
            <p className="eyebrow text-center">
              Anonymous · Destroyed after 72 hours
            </p>
            <h3 className="font-serif-display mt-5 text-center text-4xl font-light text-parchment">
              Leave a{" "}
              <span className="italic text-gold-bright">prayer request</span>
            </h3>
            <p className="mx-auto mt-5 max-w-lg text-center text-[14px] font-light leading-relaxed text-parchment-dim">
              No name. No number. No account. Your request is held and lifted
              up for three days, then the page is destroyed forever.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <div className="border border-gold-faint bg-ink-2/60 p-8 sm:p-10">
              <PrayerForm />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 text-center text-[12px] font-light leading-relaxed text-parchment-dim">
              If you are in crisis or thinking of harming yourself, please call
              or text{" "}
              <span className="font-medium text-parchment">
                988 (Suicide &amp; Crisis Lifeline)
              </span>{" "}
              right now. You matter, and help is real.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
