import { useMemo, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router";
import ProductShell from "@/components/ProductShell";
import { INTAKE_API, postJson } from "@/lib/api";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

type ReflectResponse = {
  ok: boolean;
  intake_id: string;
  figure_name: string;
  reflection: string;
};

type ClaimResponse = { ok: boolean };

type Stage = "ask" | "listening" | "reflection" | "ready";

const NEED_COPY: Record<string, { title: string; prompt: string; placeholder: string }> = {
  grief: {
    title: "You can begin with the loss.",
    prompt: "What happened, and what feels hardest about carrying it today?",
    placeholder: "I lost someone I love, and the quiet afterward has been harder than I expected…",
  },
  fear: {
    title: "You can begin with what you are afraid might happen.",
    prompt: "You do not have to sound brave here. What are you afraid of right now?",
    placeholder: "I keep thinking about what could happen next, and I cannot settle down…",
  },
  burnout: {
    title: "You can begin with how tired you are.",
    prompt: "What has been taking more from you than you have left to give?",
    placeholder: "Everyone needs something from me, and I feel like I have nothing left…",
  },
  unseen: {
    title: "You can begin with the part nobody seems to notice.",
    prompt: "Where have you felt overlooked, forgotten, or alone?",
    placeholder: "I am around people all day, but I still feel like nobody actually sees what I am carrying…",
  },
  "starting-over": {
    title: "You can begin with what changed.",
    prompt: "What are you having to rebuild, release, or begin again?",
    placeholder: "My life looks completely different than it did a few months ago, and I do not know where to begin…",
  },
  "starting over": {
    title: "You can begin with what changed.",
    prompt: "What are you having to rebuild, release, or begin again?",
    placeholder: "My life looks completely different than it did a few months ago, and I do not know where to begin…",
  },
  calling: {
    title: "You can begin with the decision in front of you.",
    prompt: "Where do you feel stuck, uncertain, or in need of direction?",
    placeholder: "I have a decision to make, and I keep going back and forth because I do not know what is wise…",
  },
  shame: {
    title: "You can begin without defending yourself.",
    prompt: "What are you carrying that you wish you could undo or stop replaying?",
    placeholder: "I made a mistake that I keep replaying, and I do not know how to move forward from it…",
  },
  unanswered: {
    title: "You can begin with the silence.",
    prompt: "What have you been praying, waiting, or hoping for that still feels unanswered?",
    placeholder: "I have been praying about the same thing for a long time, and I do not know what to do with the silence…",
  },
  unqualified: {
    title: "You can begin with the doubt.",
    prompt: "Where do you feel like you are not enough, not ready, or not the right person?",
    placeholder: "I have an opportunity in front of me, but I keep thinking someone else would be better prepared…",
  },
};

const DEFAULT_COPY = {
  title: "You do not have to explain it perfectly.",
  prompt: "Say it the way you would say it to someone who was not going to interrupt you.",
  placeholder: "A few honest words are enough. Start with what feels most true today…",
};

export default function Begin() {
  const [searchParams] = useSearchParams();
  const need = searchParams.get("need") ?? "";
  const copy = useMemo(() => NEED_COPY[need] ?? DEFAULT_COPY, [need]);

  const [stage, setStage] = useState<Stage>("ask");
  const [burden, setBurden] = useState("");
  const [consented, setConsented] = useState(false);
  const [reflection, setReflection] = useState("");
  const [storyName, setStoryName] = useState("");
  const [intakeId, setIntakeId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const reflect = async () => {
    const text = burden.trim();
    if (text.length < 3 || !consented) return;
    setError("");
    setStage("listening");

    try {
      const data = await postJson<ReflectResponse>(`${INTAKE_API}/reflect`, { burden: text });
      if (!data.ok) throw new Error("reflection_failed");
      setReflection(data.reflection);
      setStoryName(data.figure_name);
      setIntakeId(data.intake_id);
      setStage("reflection");
    } catch {
      setStage("ask");
      setError("The connection did not go through. Your words are still here — try again when you are ready.");
    }
  };

  const claim = async () => {
    if (!phone.trim() || !intakeId) return;
    setError("");

    try {
      const data = await postJson<ClaimResponse>(`${INTAKE_API}/claim`, {
        phone: phone.trim(),
        intake_id: intakeId,
      });
      if (!data.ok) throw new Error("claim_failed");
      setStage("ready");
    } catch {
      setError("We could not prepare the number just now. Please check it and try once more.");
    }
  };

  return (
    <ProductShell compact>
      <div className="mx-auto max-w-2xl">
        {stage === "ask" && (
          <section>
            <p className="eyebrow">Your free first conversation</p>
            <h1 className="font-serif-display mt-5 text-4xl font-light leading-[1.05] text-parchment sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 text-[15px] font-light leading-[1.85] text-parchment-dim sm:text-base">
              {copy.prompt}
            </p>

            <div className="mt-8 border-l border-gold-soft pl-5 font-serif-display text-xl font-light italic leading-relaxed text-parchment/90">
              The guide listens first. Scripture comes second.
            </div>

            <label htmlFor="burden" className="mt-9 block text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
              What are you carrying?
            </label>
            <textarea
              id="burden"
              value={burden}
              onChange={(event) => setBurden(event.target.value)}
              maxLength={2000}
              rows={6}
              placeholder={copy.placeholder}
              className="mt-3 w-full resize-y border border-white/12 bg-white/[0.025] px-5 py-4 text-[15px] font-light leading-relaxed text-parchment outline-none transition-colors placeholder:text-parchment-dim/45 focus:border-gold-soft"
            />

            <div className="mt-5 border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Before you share</p>
                  <p className="mt-2 text-[12px] font-light leading-[1.75] text-parchment-dim">
                    El Roi Call uses AI to reflect what you write and prepare a guided biblical conversation. It is not therapy, clergy, medical care, or crisis support. Calls may be recorded and transcribed as described in our Privacy Policy.
                  </p>
                </div>
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-[12px] font-light leading-relaxed text-parchment-dim">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(event) => setConsented(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[hsl(var(--gold))]"
                />
                <span>
                  I am 18 or older, I understand this is an AI-guided spiritual experience, and I agree to the{" "}
                  <a href="/terms/" className="text-gold hover:text-gold-bright">Terms</a> and{" "}
                  <a href="/privacy/" className="text-gold hover:text-gold-bright">Privacy Policy</a>.
                </span>
              </label>
            </div>

            {error && <p className="mt-4 text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}

            <button
              type="button"
              disabled={burden.trim().length < 3 || !consented}
              onClick={reflect}
              className="group mt-6 flex w-full items-center justify-center gap-3 bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] transition-all hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reflect this back to me
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="mt-5 text-center text-[11px] font-light leading-relaxed text-parchment-dim">
              If you may hurt yourself or someone else, or are in immediate danger, use human emergency support instead. In the U.S., call or text 988, or call 911 for an emergency.
            </p>
          </section>
        )}

        {stage === "listening" && (
          <section className="py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full border border-gold-soft/50 p-3">
              <div className="breathe h-full w-full rounded-full border border-gold-soft/40 bg-[hsl(var(--gold)/0.08)]" />
            </div>
            <p className="font-serif-display mt-8 text-3xl font-light italic text-parchment">Listening to what you actually said…</p>
            <p className="mt-3 text-[12px] font-light text-parchment-dim">Not looking for a perfect category. Just the thread that matters most.</p>
          </section>
        )}

        {stage === "reflection" && (
          <section>
            <p className="eyebrow">Here is what the guide heard</p>
            <blockquote className="font-serif-display mt-6 border-l border-gold-soft pl-5 text-2xl font-light italic leading-[1.6] text-parchment sm:text-3xl">
              “{reflection}”
            </blockquote>

            <div className="mt-8 border border-gold-soft/35 bg-[hsl(var(--gold)/0.055)] p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">One story the guide may bring into this conversation</p>
              <h2 className="font-serif-display mt-3 text-4xl font-light italic text-gold-bright">{storyName}</h2>
              <p className="mt-4 text-[13px] font-light leading-[1.75] text-parchment-dim">
                You keep talking with the same El Roi Guide. The guide may narrate and discuss {storyName}'s biblical story where it fits, but it does not imitate the biblical person or claim to speak for God.
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold">Your first guided call is free</p>
              <p className="mt-3 text-[13px] font-light leading-relaxed text-parchment-dim">
                Enter the phone number you will call from so the current call system can recognize the invitation. No card is required for this first call.
              </p>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+1 555 123 4567"
                className="mt-5 w-full border border-white/12 bg-white/[0.025] px-5 py-4 text-center text-base text-parchment outline-none transition-colors placeholder:text-parchment-dim/45 focus:border-gold-soft"
              />
              {error && <p className="mt-4 text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}
              <button
                type="button"
                onClick={claim}
                disabled={!phone.trim()}
                className="mt-5 w-full bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Ready my free call
              </button>
            </div>
          </section>
        )}

        {stage === "ready" && (
          <section className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft text-gold-bright">
              <Check className="h-5 w-5" />
            </div>
            <p className="eyebrow mt-8">Whenever you are ready</p>
            <h1 className="font-serif-display mt-4 text-5xl font-light text-parchment">Your free call is ready.</h1>
            <p className="mx-auto mt-5 max-w-lg text-[14px] font-light leading-[1.8] text-parchment-dim">
              Call from the number you entered. El Roi Guide will have the context from this beginning and may draw from {storyName}'s story if it still fits once you start talking.
            </p>
            <a
              href={PHONE_TEL}
              className="font-serif-display mt-8 block text-3xl font-light tracking-[0.08em] text-gold-bright transition-colors hover:text-parchment"
            >
              {PHONE_DISPLAY}
            </a>
            <a
              href={PHONE_TEL}
              className="mt-6 inline-flex items-center gap-3 bg-[hsl(var(--gold))] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))]"
            >
              Call now
              <ArrowRight className="h-4 w-4" />
            </a>
          </section>
        )}
      </div>
    </ProductShell>
  );
}
