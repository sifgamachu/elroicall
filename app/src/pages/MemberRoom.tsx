import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { BookOpen, CalendarClock, Gift, LogOut, Phone, ShieldCheck } from "lucide-react";
import MemberControls from "@/components/MemberControls";
import ProductShell from "@/components/ProductShell";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import {
  getPortalMember,
  type PortalMember,
  type PortalTrack,
} from "@/lib/portal";
import { supabase } from "@/lib/supabase";

const MODE_NAMES: Record<string, string> = {
  journey: "The Journey",
  sermon: "The Pulpit Walk",
  inspiration: "Daily Check-In",
  random: "Surprise Me",
};

function formatTime(track: PortalTrack) {
  if (track.hour_local == null || track.minute_local == null) return "Time not set";
  const hour = track.hour_local % 12 || 12;
  const minute = String(track.minute_local).padStart(2, "0");
  return `${hour}:${minute} ${track.hour_local < 12 ? "AM" : "PM"}`;
}

export default function MemberRoom() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [member, setMember] = useState<PortalMember | null>(null);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) setMember(null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;

    void getPortalMember(session)
      .then((data) => {
        if (active) setMember(data);
      })
      .catch(() => {
        if (active) setError("We could not load your room just now. Refresh and try again.");
      });

    return () => {
      active = false;
    };
  }, [session]);

  const refreshMember = async () => {
    if (!session) return;
    setError("");
    try {
      setMember(await getPortalMember(session));
    } catch {
      setError("We could not refresh your room just now. Try again.");
    }
  };

  const memberLoading = Boolean(session && !member && !error);
  const activeTracks = useMemo(
    () => (member?.schedules ?? []).filter((track) => track.active),
    [member?.schedules],
  );
  const primary = activeTracks[0] ?? null;
  const firstName =
    primary?.caller_name?.trim().split(/\s+/)[0] ||
    member?.caller_name?.trim().split(/\s+/)[0] ||
    "";
  const daysWalked = activeTracks.reduce(
    (max, track) => Math.max(max, track.journey_day ?? 0),
    0,
  );
  const progress = activeTracks.reduce(
    (max, track) => Math.max(max, track.progress?.pct ?? 0),
    0,
  );

  const sendLink = async () => {
    if (!email.trim()) return;
    setError("");
    setNotice("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });

    if (authError) {
      setError(authError.message);
      return;
    }
    setNotice("Check your email. The private sign-in link brings you back here.");
  };

  if (authLoading) {
    return (
      <ProductShell compact>
        <div className="py-20 text-center">
          <div className="mx-auto h-16 w-16 rounded-full border border-gold-soft/50 p-3">
            <div className="breathe h-full w-full rounded-full border border-gold-soft/40 bg-[hsl(var(--gold)/0.08)]" />
          </div>
          <p className="font-serif-display mt-7 text-3xl font-light italic text-parchment">Opening your room…</p>
        </div>
      </ProductShell>
    );
  }

  if (!session) {
    return (
      <ProductShell
        eyebrow="Your room"
        title="Return to the thread — not to an admin dashboard."
        description="Member access is organized around what matters today, what you are walking through, and what you want to return to."
        compact
      >
        <section className="mx-auto max-w-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold">Passwordless sign in</p>
          <h2 className="font-serif-display mt-3 text-3xl font-light text-parchment">We email you the door.</h2>
          <p className="mt-3 text-[12px] font-light leading-[1.75] text-parchment-dim">
            Use the email connected to your membership. There is no password to remember.
          </p>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-6 w-full border border-white/12 bg-white/[0.025] px-4 py-3.5 text-parchment outline-none placeholder:text-parchment-dim/45 focus:border-gold-soft"
          />
          {notice && <p className="mt-4 text-[12px] leading-relaxed text-gold-bright">{notice}</p>}
          {error && <p className="mt-4 text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}
          <button
            type="button"
            onClick={sendLink}
            disabled={!email.trim()}
            className="mt-5 w-full bg-[hsl(var(--gold))] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.23em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))] disabled:cursor-not-allowed disabled:opacity-35"
          >
            Email me the door
          </button>
        </section>
      </ProductShell>
    );
  }

  return (
    <ProductShell>
      <div className="space-y-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Today</p>
            <h1 className="font-serif-display mt-4 text-5xl font-light leading-none text-parchment sm:text-6xl">
              {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
            </h1>
            <p className="mt-4 text-[12px] font-light text-parchment-dim">
              {member?.email ?? session.user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="inline-flex items-center gap-2 self-start text-[10px] font-medium uppercase tracking-[0.2em] text-parchment-dim hover:text-gold-bright"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </header>

        {memberLoading ? (
          <p className="font-serif-display py-12 text-center text-2xl font-light italic text-parchment-dim">Gathering your journey…</p>
        ) : member ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="border border-gold-soft/35 bg-[hsl(var(--gold)/0.055)] p-7 sm:p-9">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">Today at the Well</p>
                <h2 className="font-serif-display mt-4 text-4xl font-light text-parchment">
                  {primary ? MODE_NAMES[primary.mode] ?? primary.mode : "Nothing is scheduled yet."}
                </h2>
                <p className="font-serif-display mt-5 text-2xl font-light italic leading-relaxed text-gold-bright">
                  {primary?.progress?.next ?? "Start with whatever is true today."}
                </p>
                {primary && (
                  <p className="mt-4 text-[11px] font-light text-parchment-dim">
                    {formatTime(primary)}{primary.days ? ` · ${primary.days}` : ""}
                    {primary.progress?.label ? ` · ${primary.progress.label}` : ""}
                  </p>
                )}
                <a
                  href={PHONE_TEL}
                  className="mt-7 inline-flex items-center gap-3 bg-[hsl(var(--gold))] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#17120a] hover:bg-[hsl(var(--gold-bright))]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Start a conversation
                </a>
              </article>

              <div className="grid grid-cols-2 gap-3">
                <Metric value={String(member.total_calls ?? 0)} label="Calls" />
                <Metric value={String(daysWalked)} label="Days walked" />
                <Metric value={`${Math.round(progress)}%`} label="Bible progress" />
                <Metric value={String(activeTracks.length)} label="Active journeys" />
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Your journeys</p>
                  <h2 className="font-serif-display mt-3 text-3xl font-light text-parchment">The rhythms you chose to keep.</h2>
                </div>
                <CalendarClock className="h-5 w-5 text-gold" />
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {activeTracks.length ? activeTracks.map((track) => (
                  <article key={`${track.mode}-${track.hour_local}-${track.minute_local}`} className="border border-white/10 bg-white/[0.02] p-5">
                    <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-gold">{MODE_NAMES[track.mode] ?? track.mode}</p>
                    <h3 className="font-serif-display mt-3 text-2xl font-light text-parchment">
                      {track.progress?.next ?? "Your next conversation"}
                    </h3>
                    <p className="mt-3 text-[11px] font-light text-parchment-dim">
                      {formatTime(track)}{track.days ? ` · ${track.days}` : ""}
                    </p>
                    {track.progress?.pct != null && (
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--gold))]"
                          style={{ width: `${Math.max(0, Math.min(track.progress.pct, 100))}%` }}
                        />
                      </div>
                    )}
                  </article>
                )) : (
                  <div className="border border-dashed border-white/12 p-6 text-[13px] font-light leading-[1.8] text-parchment-dim md:col-span-2">
                    No recurring journey is active yet. Choose one below when you want the line to reach back to you.
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
              <article className="border border-white/10 bg-white/[0.02] p-6">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Your phone</p>
                    <h2 className="font-serif-display mt-2 text-2xl font-light text-parchment">
                      {member.phone || "No number connected"}
                    </h2>
                    <p className="mt-2 text-[11px] font-light leading-relaxed text-parchment-dim">
                      {member.phone_verified
                        ? "Verified for member calling and scheduled experiences."
                        : "Verify a number below before you schedule recurring calls."}
                    </p>
                  </div>
                </div>
              </article>

              <article className="border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Recent conversations</p>
                    <h2 className="font-serif-display mt-2 text-2xl font-light text-parchment">Recognizable moments, not a transcript dump.</h2>
                  </div>
                  <BookOpen className="mt-1 h-4 w-4 shrink-0 text-gold" />
                </div>
                <div className="mt-5 space-y-4">
                  {(member.history ?? []).slice(0, 4).map((item, index) => (
                    <div key={`${item.created_at}-${index}`} className="border-t border-white/[0.08] pt-4 first:border-t-0 first:pt-0">
                      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-parchment-dim">
                        {(item.created_at ?? "").slice(0, 10)}
                        {item.figure_name ? ` · Story visited: ${item.figure_name}` : ""}
                      </p>
                      <p className="mt-2 text-[12px] font-light leading-[1.7] text-parchment/85">
                        {item.summary?.slice(0, 180) || "Conversation completed."}
                      </p>
                    </div>
                  ))}
                  {!member.history?.length && (
                    <p className="text-[12px] font-light leading-relaxed text-parchment-dim">Your completed conversations will appear here as brief summaries you can recognize later.</p>
                  )}
                </div>
              </article>
            </section>

            <MemberControls
              key={`${member.phone ?? "none"}-${member.phone_verified ? "verified" : "unverified"}-${member.schedules?.length ?? 0}`}
              session={session}
              member={member}
              onRefresh={refreshMember}
            />

            <section className="grid gap-3 sm:grid-cols-2">
              <a href="/gift/" className="inline-flex items-center justify-center gap-3 border border-gold-soft px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-bright hover:bg-[hsl(var(--gold)/0.08)]">
                <Gift className="h-3.5 w-3.5" />
                Gift a conversation
              </a>
              <a href="/about/" className="inline-flex items-center justify-center border border-white/10 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-parchment-dim hover:border-gold-soft hover:text-gold-bright">
                Why El Roi
              </a>
            </section>
          </>
        ) : null}

        {error && <p className="text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}
        <p className="text-center font-serif-display text-lg font-light italic text-parchment-dim">
          The line is always the same: {PHONE_DISPLAY}. The story can change as your life changes.
        </p>
      </div>
    </ProductShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-center border border-white/10 bg-white/[0.02] p-4 text-center">
      <p className="font-serif-display text-3xl font-light text-parchment">{value}</p>
      <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.2em] text-parchment-dim">{label}</p>
    </div>
  );
}
