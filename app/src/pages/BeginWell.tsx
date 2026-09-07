import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, LockKeyhole, Phone, ShieldCheck } from "lucide-react";
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
  { id: "surface", label: "Surface", note: "Say what is true" },
  { id: "seen", label: "Seen", note: "Be understood first" },
  { id: "scripture", label: "Scripture", note: "Open the right story" },
  { id: "return", label: "Return", note: "Carry the thread forward" },
];

export default function BeginWell() {
  const [searchParams] = useSearchParams();
  const need = searchParams.get("need") ?? "";
  const copy = useMemo(() => NEED_COPY[need] ?? DEFAULT_COPY, [need]);
  const [stage, setStage] = useState<Stage>("surface");
  const [burden, setBurden] = useState(() => {
    try {
      return sessionStorage.getItem("elroi-draft-burden") ?? "";
    } catch {
      return "";
    }
  });
  const [consented, setConsented] = useState(false);
  const [reflection, setReflection] = useState("");
  const [storyName, setStoryName] = useState("");
  const [intakeId, setIntakeId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      sessionStorage.removeItem("elroi-draft-burden");
    } catch {
      // No persistent draft is required for the flow to work.
    }
  }, []);

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
      setStage("seen");
    } catch {
      setStage("surface");
      setError("The connection did not go through. Your words are still here—nothing was lost.");
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
      setError("We could not prepare that number just now. Check it and try once more.");
    }
  };

  const activeIndex = stage === "surface" || stage === "listening" ? 0 : stage === "seen" ? 2 : 3;

  return (
    <ProductShell compact>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Inside the Well</p>
          <div className="relative mt-7 space-y-6 before:absolute before:bottom-4 before:left-[0.44rem] before:top-4 before:w-px before:bg-white/10">
            {LEVELS.map((level, index) => {
              const active = index <= activeIndex;
              return (
                <div key={level.id} className="relative flex gap-4">
                  <span className={`relative z-10 mt-1 h-3.5 w-3.5 rounded-full border ${active ? "border-gold-soft bg-[hsl(var(--gold))]" : "border-white/20 bg-[#11100d]"}`} />
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${active ? "text-gold-bright" : "text-parchment-dim/45"}`}>{level.label}</p>
                    <p className={`mt-1 text-[11px] font-light ${active ? "text-parchment-dim" : "text-parchment-dim/35"}`}>{level.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <a href={PHONE_TEL} className="mt-9 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-parchment-dim hover:text-gold-bright">
            <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
          </a>
        </aside>

        <div>
          {stage === "surface" && (
            <section>
              <p className="eyebrow">Surface · your words first</p>
              <h1 className="font-serif-display mt-5 text-4xl font-light leading-[1.02] text-parchment sm:text-6xl">{copy.title}</h1>
              <p className="mt-5 max-w-2xl text-[15px] font-light leading-[1.85] text-parchment-dim">{copy.prompt}</p>

              <textarea
                value={burden}
                onChange={(event) => setBurden(event.target.value)}
                maxLength={2000}
                rows={7}
                placeholder={copy.placeholder}
                className="font-serif-display mt-8 w-full resize-y border border-white/10 bg-white/[0.02] px-5 py-5 text-xl font-light leading-[1.65] text-parchment outline-none placeholder:text-parchment-dim/35 focus:border-gold-soft sm:text-2xl"
              />

              <div className="mt-5 border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Before this leaves your browser</p>
                    <p className="mt-2 text-[12px] font-light leading-[1.75] text-parchment-dim">
                      El Roi Call uses AI to reflect what you write and prepare a guided biblical conversation. It is not therapy, clergy, medical care, or crisis support. Calls may be recorded and transcribed as described in our Privacy Policy.
                    </p>
                  </div>
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-[12px] font-light leading-relaxed text-parchment-dim">
                  <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--gold))]" />
                  <span>I am 18 or older, I understand this is an AI-guided spiritual experience, and I agree to the <a href="/terms/" className="text-gold hover:text-gold-bright">Terms</a> and <a href="/privacy/" className="text-gold hover:text-gold-bright">Privacy Policy</a>.</span>
                </label>
              </div>

              {error && <p className="mt-4 text-[12px] text-[#e1a695]">{error}</p>}
              <button type="button" disabled={burden.trim().length < 3 || !consented} onClick={reflect} className="group mt-6 flex w-full items-center justify-between bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35">
                <span>Let El Roi reflect this back</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-5 text-center text-[10px] font-light leading-relaxed text-parchment-dim">If you may hurt yourself or someone else, or are in immediate danger, use human emergency support instead. In the U.S., call or text 988, or call 911.</p>
            </section>
          )}

          {stage === "listening" && (
            <section className="py-20 text-center">
              <div className="mx-auto h-24 w-24 rounded-full border border-gold-soft/25 p-4"><div className="breathe h-full w-full rounded-full border border-gold-soft/45 bg-[hsl(var(--gold)/0.08)]" /></div>
              <p className="font-serif-display mt-8 text-4xl font-light italic text-parchment">Stay here for a moment.</p>
              <p className="mx-auto mt-4 max-w-md text-[13px] font-light leading-[1.8] text-parchment-dim">El Roi is listening for the thread that matters—not trying to force you into a category.</p>
            </section>
          )}

          {stage === "seen" && (
            <section>
              <p className="eyebrow">Seen · before Scripture</p>
              <h1 className="font-serif-display mt-5 text-4xl font-light text-parchment sm:text-5xl">Here is what El Roi heard.</h1>
              <blockquote className="font-serif-display mt-7 border-l border-gold-soft pl-5 text-2xl font-light italic leading-[1.6] text-parchment sm:text-3xl">“{reflection}”</blockquote>

              <div className="mt-10 border border-gold-soft/35 bg-[hsl(var(--gold)/0.055)] p-6 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">A story worth opening</p>
                <h2 className="font-serif-display mt-3 text-5xl font-light italic text-gold-bright">{storyName}</h2>
                <p className="mt-4 max-w-2xl text-[13px] font-light leading-[1.8] text-parchment-dim">
                  The call does not pretend {storyName} is speaking to you. El Roi can open the actual biblical story, explore why it may fit, ask what it brings up in your life, and pray only if you want prayer.
                </p>
              </div>

              <div className="mt-8 border-t border-white/10 pt-7">
                <label htmlFor="claim-phone" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Where should your free call recognize you?</label>
                <input id="claim-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="+1 555 123 4567" className="mt-3 w-full border border-white/10 bg-white/[0.025] px-5 py-4 text-lg text-parchment outline-none placeholder:text-parchment-dim/35 focus:border-gold-soft" />
                {error && <p className="mt-3 text-[12px] text-[#e1a695]">{error}</p>}
                <button type="button" disabled={!phone.trim()} onClick={claim} className="group mt-5 flex w-full items-center justify-between bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] hover:bg-[hsl(var(--gold-bright))] disabled:opacity-35">
                  <span>Prepare my conversation</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </section>
          )}

          {stage === "ready" && (
            <section className="py-8 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold-soft/45"><Check className="h-7 w-7 text-gold-bright" /></div>
              <p className="eyebrow mt-8">Return · the thread is ready</p>
              <h1 className="font-serif-display mt-5 text-5xl font-light text-parchment sm:text-6xl">Call when you want to.</h1>
              <p className="mx-auto mt-5 max-w-xl text-[14px] font-light leading-[1.85] text-parchment-dim">El Roi will know the starting context you just shared. You can change direction, decline prayer, or end the conversation at any time.</p>
              <a href={PHONE_TEL} className="font-serif-display mt-8 block text-4xl font-light tracking-[0.05em] text-gold-bright hover:text-parchment">{PHONE_DISPLAY}</a>
              <div className="mx-auto mt-8 flex max-w-md items-start gap-3 border border-white/10 bg-white/[0.02] p-4 text-left text-[11px] font-light leading-relaxed text-parchment-dim">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <p>Returning-user memory is being designed as explicit, visible, user-controlled context—not hidden profile accumulation.</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </ProductShell>
  );
}
