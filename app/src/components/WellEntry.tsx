import { useState } from "react";
import { ArrowRight, LockKeyhole, Phone, Waves } from "lucide-react";
import { useNavigate } from "react-router";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

const NEEDS = [
  { label: "I lost someone", value: "grief" },
  { label: "I'm scared", value: "fear" },
  { label: "I made a mistake", value: "shame" },
  { label: "I'm exhausted", value: "burnout" },
  { label: "I feel alone", value: "unseen" },
  { label: "I need direction", value: "calling" },
];

export default function WellEntry() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");

  const continueWithDraft = () => {
    const text = draft.trim();
    if (!text) return;
    try {
      sessionStorage.setItem("elroi-draft-burden", text);
    } catch {
      // The next screen still works if private-mode storage is unavailable.
    }
    navigate("/begin/");
  };

  return (
    <section id="top" className="relative min-h-svh overflow-hidden bg-[#0b0a08] text-[#f5eddc]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(233,197,121,0.17),transparent_26%),linear-gradient(180deg,rgba(255,247,223,0.04),transparent_34%)]" />
      <div className="well-grid pointer-events-none absolute inset-0 opacity-35" />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col px-6 pb-16 pt-28 lg:px-10">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-3 border-b border-[#d4ae62]/40 pb-3 text-[10px] font-medium uppercase tracking-[0.34em] text-[#d9b86f]">
              <Waves className="h-4 w-4" />
              El Roi · the God who sees
            </div>
            <h1 className="font-serif-display text-[clamp(3.5rem,8vw,7.2rem)] font-light leading-[0.9] tracking-[-0.03em]">
              Tell me
              <span className="block italic text-[#dfbd73]">what happened.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base font-light leading-[1.85] text-[#b9ad98] sm:text-lg">
              You do not need the right words. Start with the true ones. El Roi listens before it explains, before it chooses a story, and before it asks you to do anything else.
            </p>
            <blockquote className="font-serif-display mt-8 max-w-md border-l border-[#cda85d]/70 pl-5 text-xl font-light italic leading-relaxed text-[#e9dfcb]">
              “You are the God who sees me.”
              <span className="mt-2 block font-sans text-[9px] not-italic uppercase tracking-[0.28em] text-[#a99368]">Genesis 16:13</span>
            </blockquote>
          </div>

          <div className="relative mx-auto w-full max-w-2xl py-8 lg:py-14">
            <div className="well-beam pointer-events-none absolute left-1/2 top-[-9rem] h-[24rem] w-[22rem] -translate-x-1/2" />
            <div className="well-ring well-ring-outer pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#caa456]/12" />
            <div className="well-ring pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#caa456]/18" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e1c27b]/22 bg-[radial-gradient(circle_at_50%_42%,rgba(205,168,93,0.08),rgba(0,0,0,0.18)_58%,rgba(0,0,0,0.55)_100%)] shadow-[0_35px_100px_rgba(0,0,0,.55)]" />

            <div className="relative z-10 mx-auto max-w-xl border border-[#d5b46d]/35 bg-[#11100d]/92 p-5 shadow-[0_40px_120px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#d8b56b]">At the edge of the Well</p>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8e836f]"><LockKeyhole className="h-3 w-3" /> private draft</span>
              </div>
              <label htmlFor="well-draft" className="font-serif-display mt-5 block text-3xl font-light text-[#f5eddc] sm:text-4xl">
                What are you carrying today?
              </label>
              <textarea
                id="well-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") continueWithDraft();
                }}
                rows={5}
                maxLength={2000}
                placeholder="I haven't told anyone this, but…"
                className="mt-5 w-full resize-none border-0 border-b border-[#c7a45d]/35 bg-transparent px-0 py-4 text-[17px] font-light leading-[1.75] text-[#f5eddc] outline-none placeholder:text-[#766d5f] focus:border-[#e1bd6e]"
              />
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {NEEDS.map((need) => (
                  <button
                    key={need.value}
                    type="button"
                    onClick={() => navigate(`/begin/?need=${need.value}`)}
                    className="min-h-11 border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-left text-[11px] font-light text-[#c9bdab] transition-colors hover:border-[#d5b46d]/55 hover:bg-[#d5b46d]/[0.07] hover:text-[#f5eddc]"
                  >
                    {need.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={continueWithDraft}
                className="group mt-5 flex w-full items-center justify-between bg-[#d6b267] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-[#17130d] transition-all hover:bg-[#e6c77e] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span>Continue with what I wrote</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-4 text-[10px] font-light leading-relaxed text-[#8f8371]">
                What you type here stays in this browser until you continue. The next screen explains AI use, privacy, and consent before anything is submitted.
              </p>
            </div>

            <a href={PHONE_TEL} className="relative z-10 mx-auto mt-8 flex w-fit items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#9e917c] transition-colors hover:text-[#e1bd6e]">
              <Phone className="h-3.5 w-3.5" /> Prefer voice · {PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <a href="#descent" className="mx-auto mt-6 flex flex-col items-center gap-2 text-[9px] font-medium uppercase tracking-[0.28em] text-[#766d60] transition-colors hover:text-[#d8b56b]">
          <span>Go deeper</span>
          <span className="h-10 w-px bg-gradient-to-b from-[#a98d54] to-transparent" />
        </a>
      </div>
    </section>
  );
}
