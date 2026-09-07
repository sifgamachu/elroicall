import { useEffect, useMemo, useState } from "react";
import { Check, Gift, ShieldCheck } from "lucide-react";
import { useParams, useSearchParams } from "react-router";
import ProductShell from "@/components/ProductShell";
import { GIFT_API, postJson, requestJson } from "@/lib/api";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

type GiftLookup = {
  ok: boolean;
  status?: string;
  expired?: boolean;
  giver_name?: string;
  message?: string;
};

type GiftClaim = { ok: boolean; error?: string };

type View = "loading" | "gift" | "ready" | "bad";

export default function GiftRedeem() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const code = useMemo(() => params.code ?? searchParams.get("c") ?? "", [params.code, searchParams]);

  const [view, setView] = useState<View>("loading");
  const [gift, setGift] = useState<GiftLookup | null>(null);
  const [phone, setPhone] = useState("");
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState("");
  const [badMessage, setBadMessage] = useState("This gift could not be found.");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!code || code === "g") {
        setBadMessage("This gift could not be found.");
        setView("bad");
        return;
      }

      try {
        const data = await requestJson<GiftLookup>(`${GIFT_API}/${encodeURIComponent(code)}`);
        if (cancelled) return;
        if (!data.ok) throw new Error("gift_missing");
        if (data.status === "used") {
          setBadMessage("This gift has already been used.");
          setView("bad");
          return;
        }
        if (data.expired) {
          setBadMessage("This gift has expired.");
          setView("bad");
          return;
        }
        setGift(data);
        setView("gift");
      } catch {
        if (!cancelled) {
          setBadMessage("This gift could not be opened just now.");
          setView("bad");
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const claim = async () => {
    if (!phone.trim() || !consented || !code) return;
    setError("");

    try {
      const data = await postJson<GiftClaim>(`${GIFT_API}/claim`, {
        code,
        phone: phone.trim(),
      });
      if (!data.ok) {
        if (data.error === "already_used") throw new Error("already_used");
        throw new Error("claim_failed");
      }
      setView("ready");
    } catch (claimError) {
      setError(
        claimError instanceof Error && claimError.message === "already_used"
          ? "This gift has already been claimed."
          : "We could not prepare the call just now. Please try once more.",
      );
    }
  };

  return (
    <ProductShell compact>
      <div className="mx-auto max-w-2xl text-center">
        {view === "loading" && (
          <section className="py-16">
            <div className="mx-auto h-16 w-16 rounded-full border border-gold-soft/50 p-3">
              <div className="breathe h-full w-full rounded-full border border-gold-soft/40 bg-[hsl(var(--gold)/0.08)]" />
            </div>
            <p className="font-serif-display mt-7 text-3xl font-light italic text-parchment">Opening your gift…</p>
          </section>
        )}

        {view === "gift" && gift && (
          <section>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-soft/45 text-gold-bright">
              <Gift className="h-4 w-4" />
            </div>
            <p className="eyebrow mt-7">Someone wanted you to have a place to start</p>
            <h1 className="font-serif-display mt-4 text-5xl font-light leading-[1.06] text-parchment">
              {gift.giver_name ? `${gift.giver_name} sent you a conversation.` : "You have been given a conversation."}
            </h1>

            {gift.message && (
              <blockquote className="font-serif-display mx-auto mt-7 max-w-xl border-l border-gold-soft pl-5 text-left text-xl font-light italic leading-[1.65] text-parchment/90">
                “{gift.message}”
              </blockquote>
            )}

            <p className="mx-auto mt-7 max-w-xl text-[14px] font-light leading-[1.85] text-parchment-dim">
              El Roi Call is one AI-guided spiritual conversation that begins with what you are actually carrying. The guide may bring in a biblical story when it fits, but you decide what to talk about and when to stop.
            </p>

            <div className="mt-8 border border-white/10 bg-white/[0.02] p-5 text-left">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Before you claim it</p>
                  <p className="mt-2 text-[12px] font-light leading-[1.75] text-parchment-dim">
                    This is AI, not a real person, biblical figure, God, clergy, counselor, or therapist. Calls may be recorded and transcribed under our current Privacy Policy. This is for adults 18+ and is not crisis support.
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
                  I am 18 or older and agree to the{" "}
                  <a href="/terms/" className="text-gold hover:text-gold-bright">Terms</a> and{" "}
                  <a href="/privacy/" className="text-gold hover:text-gold-bright">Privacy Policy</a>.
                </span>
              </label>
            </div>

            <label htmlFor="gift-phone" className="mt-7 block text-left text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
              Phone number you will call from
            </label>
            <input
              id="gift-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1 555 123 4567"
              className="mt-3 w-full border border-white/12 bg-white/[0.025] px-5 py-4 text-center text-base text-parchment outline-none placeholder:text-parchment-dim/45 focus:border-gold-soft"
            />

            {error && <p className="mt-4 text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}

            <button
              type="button"
              onClick={claim}
              disabled={!consented || !phone.trim()}
              className="mt-5 w-full bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Claim my free call
            </button>

            <p className="mt-5 text-[11px] font-light leading-relaxed text-parchment-dim">
              If you may hurt yourself or someone else, or are in immediate danger, use human emergency support instead. In the U.S., call or text 988, or call 911 for an emergency.
            </p>
          </section>
        )}

        {view === "ready" && (
          <section className="py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft text-gold-bright">
              <Check className="h-5 w-5" />
            </div>
            <p className="eyebrow mt-8">Your gift is ready</p>
            <h1 className="font-serif-display mt-4 text-5xl font-light text-parchment">Call whenever you want the conversation.</h1>
            <p className="mx-auto mt-5 max-w-lg text-[14px] font-light leading-[1.8] text-parchment-dim">
              There is no account to set up for this gift. Call from the phone number you entered and begin with whatever is true that day.
            </p>
            <a
              href={PHONE_TEL}
              className="font-serif-display mt-8 block text-3xl font-light tracking-[0.08em] text-gold-bright hover:text-parchment"
            >
              {PHONE_DISPLAY}
            </a>
          </section>
        )}

        {view === "bad" && (
          <section className="py-10">
            <p className="eyebrow">This gift</p>
            <h1 className="font-serif-display mt-5 text-5xl font-light text-parchment">{badMessage}</h1>
            <p className="mx-auto mt-5 max-w-lg text-[14px] font-light leading-[1.8] text-parchment-dim">
              The link may be mistyped, expired, or already used. You can ask the sender for a fresh link or begin with El Roi Call directly.
            </p>
            <a
              href="/begin/"
              className="mt-7 inline-block bg-[hsl(var(--gold))] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#17120a]"
            >
              Start a free conversation
            </a>
          </section>
        )}
      </div>
    </ProductShell>
  );
}
