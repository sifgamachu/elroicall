import { useState } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Textarea } from "@/components/ui/textarea";
import { Flame, ShieldCheck } from "lucide-react";

const SB_URL = "https://mkocnufwmsfchivfbhuf.supabase.co";
const SB_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2NudWZ3bXNmY2hpdmZiaHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjcyNjUsImV4cCI6MjA5OTgwMzI2NX0.6SQI1J1ojAiKkfPzZZVh-3UyPlaaqv-Gxw4qYP9FPxs";

const TRACKS = [
  {
    guide: "Daily · One Year",
    title: "The Journey",
    body: "Walk through the whole Bible over one year — Genesis to Revelation — with a scheduled voice experience that follows your progress.",
  },
  {
    guide: "Daily · Every Chapter",
    title: "The Pulpit Walk",
    body: "Move through all 1,189 chapters of Scripture one chapter at a time, with a guided message built around the text for that day.",
  },
  {
    guide: "Daily · A Check-In",
    title: "Daily Check-In",
    body: "A shorter recurring call: one story, one scripture, one reflection for your day, and a prayer.",
  },
  {
    guide: "Daily · Unscripted",
    title: "Surprise Me",
    body: "A different biblical story and theme each time, designed to take you beyond the passages you already know best.",
  },
];

function PrayerForm() {
  const [value, setValue] = useState("");
  const [consented, setConsented] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const placeInWell = async () => {
    const request = value.trim().slice(0, 2000);
    if (!request || !consented || sending) return;
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
        body: JSON.stringify({ request, source: "web-v2" }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setPlaced(true);
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
          Your request is in the Well.
        </p>
        <p className="max-w-md text-[13px] font-light leading-relaxed text-parchment-dim">
          This form does not ask for your name or phone number. El Roi Call's current policy is to remove prayer requests after 72 hours; retention and deletion details are described in the Privacy Policy.
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
        placeholder="Write what you would like prayer for…"
        rows={5}
        maxLength={2000}
        className="resize-none rounded-none border-gold-faint bg-ink px-5 py-4 font-serif-display text-lg italic text-parchment placeholder:text-parchment-dim/50 focus-visible:ring-1 focus-visible:ring-[hsl(var(--gold))]"
      />

      <div className="border border-gold-faint bg-black/15 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold">Before you place it here</p>
            <p className="mt-2 text-[11.5px] font-light leading-relaxed text-parchment-dim">
              What you write is sent to our prayer-request storage. This form does not request your name or phone number, but you should avoid adding identifying details if you want the request to remain anonymous. This is not crisis support.
            </p>
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[11.5px] font-light leading-relaxed text-parchment-dim">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--gold))]"
          />
          <span>
            I understand and agree to the <a href="/privacy/" className="text-gold hover:text-gold-bright">Privacy Policy</a> for this request.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending || !value.trim() || !consented}
          className="bg-[hsl(var(--gold))] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1a1409] transition-all duration-300 hover:bg-[hsl(var(--gold-bright))] disabled:opacity-45"
        >
          {sending ? "Placing it…" : "Place It in the Well"}
        </button>
        {failed && (
          <p className="text-[12px] font-light text-parchment-dim">
            The request wasn't received just now — please try again.
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
              Come back tomorrow —{" "}
              <span className="italic text-gold-bright">and keep walking.</span>
            </>
          }
          copy="A meaningful call can be one moment. The Well turns it into a rhythm: choose a track, choose a time, and let Scripture meet you again tomorrow."
        />

        <div className="mt-16 grid gap-px overflow-hidden border border-gold-faint bg-[hsl(var(--gold)/0.12)] sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((track, i) => (
            <Reveal key={track.title} delay={i * 0.1} className="h-full">
              <article className="group flex h-full flex-col bg-ink p-8 transition-colors duration-500 hover:bg-ink-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                  {track.guide}
                </p>
                <h3 className="font-serif-display mt-4 text-2xl font-medium text-parchment">
                  {track.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] font-light leading-relaxed text-parchment-dim">
                  {track.body}
                </p>
                <span className="mt-6 block h-px w-8 bg-[hsl(var(--gold)/0.4)] transition-all duration-500 group-hover:w-16 group-hover:bg-[hsl(var(--gold))]" />
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-2xl">
          <Reveal>
            <p className="eyebrow text-center">Prayer Well · no name or phone requested</p>
            <h3 className="font-serif-display mt-5 text-center text-4xl font-light text-parchment">
              Leave a <span className="italic text-gold-bright">prayer request</span>
            </h3>
            <p className="mx-auto mt-5 max-w-lg text-center text-[14px] font-light leading-relaxed text-parchment-dim">
              Write only what you want to share. If anonymity matters to you, do not include identifying information in the request itself.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-10">
            <div className="border border-gold-faint bg-ink-2/60 p-8 sm:p-10">
              <PrayerForm />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 text-center text-[12px] font-light leading-relaxed text-parchment-dim">
              If you may hurt yourself or someone else, or are in immediate danger, use human emergency support instead. In the U.S., call or text <span className="font-medium text-parchment">988</span>, or call <span className="font-medium text-parchment">911</span> for an emergency.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
