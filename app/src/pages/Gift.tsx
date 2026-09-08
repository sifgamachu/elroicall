import { useState } from "react";
import { Check, Copy, Gift as GiftIcon, Send } from "lucide-react";
import ProductShell from "@/components/ProductShell";
import { GIFT_API, postJson } from "@/lib/api";

type GiftResponse = {
  ok: boolean;
  link: string;
  sms_suggestion: string;
};

export default function Gift() {
  const [giver, setGiver] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GiftResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const createGift = async () => {
    if (!giver.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const data = await postJson<GiftResponse>(`${GIFT_API}/create`, {
        giver_name: giver.trim(),
        recipient_phone: recipient.trim() || undefined,
        message: message.trim() || undefined,
      });
      if (!data.ok) throw new Error("gift_failed");
      setResult(data);
    } catch {
      setError("We could not confirm that your gift was prepared. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyMessage = async () => {
    if (!result?.sms_suggestion) return;
    try {
      await navigator.clipboard.writeText(result.sms_suggestion);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy is unavailable. Select and copy the gift message below.");
    }
  };

  return (
    <ProductShell
      eyebrow="Gift a conversation"
      title="You do not need the perfect words to show someone you care."
      description="Give someone one free conversation with El Roi Guide. They choose whether to open it, what to talk about, and when to call."
      compact
    >
      <div className="mx-auto max-w-2xl">
        {!result ? (
          <section className="border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-start gap-4 border-b border-white/8 pb-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-soft/40 bg-[hsl(var(--gold)/0.06)] text-gold-bright">
                <GiftIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-serif-display text-2xl font-light text-parchment">A gift of being heard.</h2>
                <p className="mt-2 text-[12px] font-light leading-relaxed text-parchment-dim">
                  This does not choose a biblical story for them. It simply gives them a place to begin with the same El Roi Guide when they are ready.
                </p>
              </div>
            </div>

            <label className="mt-6 block text-[10px] font-medium uppercase tracking-[0.24em] text-gold" htmlFor="giver">
              Your name
            </label>
            <input
              id="giver"
              value={giver}
              onChange={(event) => setGiver(event.target.value)}
              maxLength={60}
              placeholder="e.g. Sarah"
              className="mt-3 w-full border border-white/12 bg-white/[0.025] px-4 py-3.5 text-parchment outline-none placeholder:text-parchment-dim/45 focus:border-gold-soft"
            />

            <label className="mt-6 block text-[10px] font-medium uppercase tracking-[0.24em] text-gold" htmlFor="recipient">
              Their phone number <span className="normal-case tracking-normal text-parchment-dim">(optional)</span>
            </label>
            <input
              id="recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              type="tel"
              inputMode="tel"
              placeholder="+1 555 123 4567"
              className="mt-3 w-full border border-white/12 bg-white/[0.025] px-4 py-3.5 text-parchment outline-none placeholder:text-parchment-dim/45 focus:border-gold-soft"
            />
            <p className="mt-2 text-[11px] font-light leading-relaxed text-parchment-dim">
              Leave this blank if you would rather share the private gift link yourself.
            </p>

            <label className="mt-6 block text-[10px] font-medium uppercase tracking-[0.24em] text-gold" htmlFor="message">
              A short note <span className="normal-case tracking-normal text-parchment-dim">(optional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={400}
              rows={4}
              placeholder="Thinking of you. No pressure to use this — I just wanted you to have it."
              className="mt-3 w-full resize-y border border-white/12 bg-white/[0.025] px-4 py-3.5 text-parchment outline-none placeholder:text-parchment-dim/45 focus:border-gold-soft"
            />

            {error && <p className="mt-4 text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}

            <button
              type="button"
              onClick={createGift}
              disabled={!giver.trim() || submitting}
              className="mt-7 flex w-full items-center justify-center gap-3 bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Preparing…" : "Create the gift"}
            </button>
          </section>
        ) : (
          <section className="border border-gold-soft/35 bg-[hsl(var(--gold)/0.05)] p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-soft text-gold-bright">
              <Check className="h-5 w-5" />
            </div>
            <p className="eyebrow mt-7">Your gift is ready</p>
            <h2 className="font-serif-display mt-3 text-4xl font-light text-parchment">Give them the invitation, not the pressure.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[13px] font-light leading-[1.75] text-parchment-dim">
              The recipient still chooses whether to claim it. The gift only opens the door.
            </p>

            <div className="mt-7 border border-white/10 bg-black/15 p-4 text-left">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-gold">Private gift link</p>
              <p className="mt-2 break-all text-[12px] leading-relaxed text-parchment">{result.link}</p>
            </div>

            <div className="mt-4 border-l border-gold-soft/60 bg-white/[0.025] p-4 text-left font-serif-display text-lg font-light italic leading-relaxed text-parchment/90">
              {result.sms_suggestion}
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-[#e1a695]">{error}</p>}
            <button
              type="button"
              onClick={copyMessage}
              className="mt-5 inline-flex items-center gap-2 border border-gold-soft px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-bright transition-colors hover:bg-[hsl(var(--gold)/0.08)]"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy message"}
            </button>
          </section>
        )}
      </div>
    </ProductShell>
  );
}
