import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Phone, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router";
import ProductShell from "@/components/ProductShell";
import { INTAKE_API, postJson } from "@/lib/api";
import { normalizePhone, PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import { useDraft } from "@/lib/draft";

type ReflectResponse = {
  ok: boolean;
  intake_id: string;
  figure_name: string;
  reflection: string;
};

type ClaimResponse = { ok: boolean };
type Stage = "surface" | "listening" | "seen" | "ready";

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
  shame: {
    title: "You can begin without defending yourself.",
    prompt: "What are you carrying that you wish you could undo or stop replaying?",
    placeholder: "I made a mistake that I keep replaying, and I do not know how to move forward from it…",
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
  calling: {
    title: "You can begin with the decision in front of you.",
    prompt: "Where do you feel stuck, uncertain, or responsible for something that needs to change?",
    placeholder: "I have a decision to make, and I keep going back and forth because I do not know what is wise…",
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
  "starting-over": {
    title: "You can begin with what changed.",
    prompt: "What are you having to rebuild, release, or begin again?",
    placeholder: "My life looks completely different than it did a few months ago, and I do not know where to begin…",
  },
  betrayal: {
    title: "You can begin with what they did.",
    prompt: "What happened, and what has been hardest to make sense of since the trust was broken?",
    placeholder: "I did not expect this from someone I trusted, and I keep replaying how I missed it…",
  },
};

const DEFAULT_COPY = {
  title: "Stay with the true sentence.",
  prompt: "Say it the way you would say it to someone who was not going to interrupt you.",
  placeholder: "I haven't told anyone this, but…",
};

const LEVELS = [
  { id: "surface", label: "Share", note: "Your words" },
  { id: "seen", label: "Reflect", note: "A place to begin" },
  { id: "ready", label: "Call", note: "Continue by voice" },
];

export default function BeginWell() {
  const [searchParams] = useSearchParams();
  const need = searchParams.get("need") ?? "";
  const copy = useMemo(() => NEED_COPY[need] ?? DEFAULT_COPY, [need]);
  const [stage, setStage] = useState<Stage>("surface");
  const { draft: burden, setDraft: setBurden } = useDraft();
  const [consented, setConsented] = useState(false);
  const [reflection, setReflection] = useState("");
  const [storyName, setStoryName] = useState("");
  const [intakeId, setIntakeId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [preparedPhone, setPreparedPhone] = useState("");
  const pending = useRef<AbortController | null>(null);
  const heading = useRef<HTMLDivElement>(null);
  const normalizedPhone = normalizePhone(phone);

  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [stage]);

  const reflect = async () => {
    const text = burden.trim();
    if (text.length < 3 || !consented || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setError("");
    setStage("listening");

    try {
      const data = await postJson<ReflectResponse>(`${INTAKE_API}/reflect`, { burden: text }, controller.signal);
      if (!data?.ok || typeof data.reflection !== "string" || !data.reflection.trim() || typeof data.figure_name !== "string" || !data.figure_name.trim() || typeof data.intake_id !== "string" || !data.intake_id.trim()) throw new Error("reflection_failed");
      setReflection(data.reflection);
      setStoryName(data.figure_name);
      setIntakeId(data.intake_id);
      setStage("seen");
    } catch {
      if (controller.signal.aborted) return;
      setStage("surface");
      setError("We could not complete your reflection. Your words are still here. Try again, or call and share them by voice.");
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  };

  const claim = async () => {
    if (!normalizedPhone || !intakeId || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setClaiming(true);
    setError("");
    try {
      const data = await postJson<ClaimResponse>(`${INTAKE_API}/claim`, {
        phone: normalizedPhone,
        intake_id: intakeId,
      }, controller.signal);
      if (!data?.ok) throw new Error("claim_failed");
      setPreparedPhone(normalizedPhone);
      setStage("ready");
    } catch {
      if (controller.signal.aborted) return;
      setError("We could not confirm that your number is ready. Check it and try again, or call and share your starting words by voice.");
    } finally {
      if (pending.current === controller) pending.current = null;
      if (!controller.signal.aborted) setClaiming(false);
    }
  };

  const activeIndex = stage === "surface" || stage === "listening" ? 0 : stage === "seen" ? 1 : 2;

  return (
    <ProductShell>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Inside the Well</p>
          <div aria-label="Conversation setup progress" className="relative mt-5 flex justify-between gap-3 lg:block lg:space-y-6">
            {LEVELS.map((level, index) => {
              const active = index <= activeIndex;
              return (
                <div key={level.id} aria-current={index === activeIndex ? "step" : undefined} className="relative flex gap-3">
                  <span className={`relative z-10 mt-1 h-3.5 w-3.5 rounded-full border ${active ? "border-gold-soft bg-[hsl(var(--gold))]" : "border-white/20 bg-[#11100d]"}`} />
                  <div>
                    <p className={`text-sm font-semibold ${active ? "text-gold-bright" : "text-parchment-dim"}`}>{level.label}</p>
                    <p className="mt-1 hidden text-sm font-light text-parchment-dim lg:block">{level.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <a href={PHONE_TEL} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-parchment-dim hover:text-gold-bright">
            <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
          </a>
        </aside>

        <div ref={heading} tabIndex={-1} className="min-w-0 outline-none">
          {stage === "surface" && (
            <section>
              <p className="eyebrow">Surface · your words first</p>
              <h1 className="font-serif-display mt-5 text-4xl font-light leading-[1.02] text-parchment sm:text-6xl">{copy.title}</h1>
              <p className="mt-5 max-w-2xl text-base font-light leading-[1.85] text-parchment-dim">{copy.prompt}</p>

              <label htmlFor="begin-burden" className="mt-6 block text-sm text-gold">What are you carrying?</label>
              <textarea
                id="begin-burden"
                value={burden}
                onChange={(event) => setBurden(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder={copy.placeholder}
                className="font-serif-display mt-3 w-full resize-y border border-white/10 bg-white/[0.02] px-5 py-5 text-xl font-light leading-[1.65] text-parchment outline-none placeholder:text-parchment-dim/50 focus:border-gold-soft sm:text-2xl"
              />

              <div className="mt-5 border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Before this leaves your browser</p>
                    <p className="mt-2 text-sm font-light leading-[1.75] text-parchment-dim">
                      El Roi Call uses AI to reflect what you write and prepare a guided biblical conversation. It is not therapy, clergy, medical care, or crisis support. Calls may be recorded and transcribed as described in our Privacy Policy.
                    </p>
                  </div>
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-light leading-relaxed text-parchment-dim">
                  <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--gold))]" />
                  <span>I am 18 or older, I understand this is an AI-guided spiritual experience, and I agree to the <a href="/terms/" className="text-gold hover:text-gold-bright">Terms</a> and <a href="/privacy/" className="text-gold hover:text-gold-bright">Privacy Policy</a>.</span>
                </label>
              </div>

              {error && <div role="alert" className="mt-4 text-sm text-[#e1a695]"><p>{error}</p><a href={PHONE_TEL} className="mt-3 inline-flex min-h-11 items-center gap-2 text-gold-bright underline"><Phone className="h-4 w-4" />Call instead · {PHONE_DISPLAY}</a></div>}
              <button type="button" disabled={burden.trim().length < 3 || !consented} onClick={reflect} className="group mt-6 flex w-full items-center justify-between bg-[hsl(var(--gold))] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#17120a] hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35">
                <span>Let El Roi reflect this back</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-5 text-center text-sm font-light leading-relaxed text-parchment-dim">If you may hurt yourself or someone else, or are in immediate danger, use human emergency support instead. In the U.S., call or text 988, or call 911.</p>
            </section>
          )}

          {stage === "listening" && (
            <section role="status" aria-live="polite" className="py-20 text-center">
              <div className="mx-auto h-24 w-24 rounded-full border border-gold-soft/25 p-4"><div className="breathe h-full w-full rounded-full border border-gold-soft/45 bg-[hsl(var(--gold)/0.08)]" /></div>
              <p className="font-serif-display mt-8 text-4xl font-light italic text-parchment">Stay here for a moment.</p>
              <p className="mx-auto mt-4 max-w-md text-base font-light leading-[1.8] text-parchment-dim">Your AI reflection is being prepared. This may take a few seconds.</p>
              <button type="button" onClick={() => { pending.current?.abort(); pending.current = null; setStage("surface"); }} className="mt-6 min-h-11 text-sm text-gold-bright underline">Go back to my words</button>
            </section>
          )}

          {stage === "seen" && (
            <section>
              <p className="eyebrow">Seen · before Scripture</p>
              <h1 className="font-serif-display mt-5 text-4xl font-light text-parchment sm:text-5xl">Here is what El Roi heard.</h1>
              <blockquote className="font-serif-display mt-7 border-l border-gold-soft pl-5 text-2xl font-light italic leading-[1.6] text-parchment sm:text-3xl">“{reflection}”</blockquote>
              <button type="button" disabled={claiming} onClick={() => { setError(""); setStage("surface"); }} className="mt-4 min-h-11 text-sm text-gold-bright underline disabled:opacity-35">Not quite? Edit what I shared</button>

              <div className="mt-10 border border-gold-soft/35 bg-[hsl(var(--gold)/0.055)] p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">A story worth opening</p>
                <h2 className="font-serif-display mt-3 text-5xl font-light italic text-gold-bright">{storyName}</h2>
                <p className="mt-4 max-w-2xl text-sm font-light leading-[1.8] text-parchment-dim">
                  The call does not pretend {storyName} is speaking to you. El Roi can open the actual biblical story, explore why it may fit, ask what it brings up in your life, and pray only if you want prayer.
                </p>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); void claim(); }} aria-busy={claiming} className="mt-8 border-t border-white/10 pt-7">
                <label htmlFor="claim-phone" className="text-sm font-semibold text-gold">The phone number you will call from</label>
                <p id="phone-help" className="mt-2 text-sm leading-relaxed text-parchment-dim">First call free. No card. You call us when you are ready; submitting this form does not start a call. Outside the U.S. or Canada, include + and your country code.</p>
                <input id="claim-phone" type="tel" required disabled={claiming} aria-describedby="phone-help phone-error" aria-invalid={Boolean(phone.trim() && !normalizedPhone)} value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} inputMode="tel" autoComplete="tel" placeholder="(202) 555-0123" className="mt-3 w-full border border-white/10 bg-white/[0.025] px-5 py-4 text-lg text-parchment outline-none placeholder:text-parchment-dim/50 focus:border-gold-soft" />
                <p id="phone-error" aria-live="polite" className="mt-3 text-sm text-[#e1a695]">{phone.trim() && !normalizedPhone ? "Enter a complete phone number, including country code for international numbers." : ""}</p>
                {error && <div role="alert" className="mt-3 text-sm text-[#e1a695]"><p>{error}</p><a href={PHONE_TEL} className="mt-3 inline-flex min-h-11 items-center gap-2 text-gold-bright underline">Call instead · {PHONE_DISPLAY}</a></div>}
                <button type="submit" disabled={!normalizedPhone || claiming} className="group mt-5 flex w-full items-center justify-between bg-[hsl(var(--gold))] px-6 py-4 text-sm font-semibold text-[#17120a] hover:bg-[hsl(var(--gold-bright))] disabled:opacity-35">
                  <span>{claiming ? "Preparing your conversation…" : "Prepare my free call"}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </section>
          )}

          {stage === "ready" && (
            <section className="py-8 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold-soft/45"><Check className="h-7 w-7 text-gold-bright" /></div>
              <p className="eyebrow mt-8">Your starting words are saved</p>
              <h1 className="font-serif-display mt-5 text-5xl font-light text-parchment sm:text-6xl">Ready when you are.</h1>
              <p className="mx-auto mt-5 max-w-xl text-base font-light leading-[1.85] text-parchment-dim">Call from <strong className="font-medium text-parchment">{preparedPhone}</strong> so the phone service can match your starting words. You can change direction, decline prayer, or end the conversation at any time.</p>
              <a href={PHONE_TEL} className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 bg-[hsl(var(--gold))] px-10 py-4 text-base font-semibold text-[#17120a] hover:bg-[hsl(var(--gold-bright))]"><Phone className="h-5 w-5" />Call now</a>
              <a href={PHONE_TEL} className="font-serif-display mt-5 block text-3xl font-light text-gold-bright hover:text-parchment sm:text-4xl">{PHONE_DISPLAY}</a>
              <p className="mt-5 text-sm text-parchment-dim">On a computer? Dial this number on your phone. We will not call you automatically.</p>
              <button type="button" onClick={() => { setError(""); setStage("seen"); }} className="mt-4 min-h-11 text-sm text-gold-bright underline">Use a different phone number</button>
            </section>
          )}
        </div>
      </div>
    </ProductShell>
  );
}
