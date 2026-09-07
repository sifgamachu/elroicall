import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowRight, BookOpen, CalendarClock, Gift, LogOut, Phone, ShieldCheck } from "lucide-react";
import ProductShell from "@/components/ProductShell";
import { PORTAL_API } from "@/lib/api";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";
import { SUPABASE_ANON_KEY, supabase } from "@/lib/supabase";

type Progress = {
  chapters_done?: number;
  pct?: number;
  label?: string;
  next?: string;
};

type MemberTrack = {
  mode: string;
  active: boolean;
  journey_day?: number;
  hour_local?: number;
  minute_local?: number;
  tz?: string;
  days?: string;
  caller_name?: string;
  progress?: Progress;
};

type HistoryItem = {
  created_at?: string;
  figure_name?: string;
  summary?: string;
};

type MemberData = {
  email?: string;
  caller_name?: string;
  phone?: string;
  phone_verified?: boolean;
  total_calls?: number;
  schedules?: MemberTrack[];
  history?: HistoryItem[];
};

const MODE_NAMES: Record<string, string> = {
  journey: "The Journey",
  sermon: "The Pulpit Walk",
  inspiration: "Daily Check-In",
  random: "Surprise Me",
};

function formatTrackTime(track: MemberTrack) {
  if (track.hour_local == null || track.minute_local == null) return "Time not set";
  const hour = track.hour_local % 12 || 12;
  const minute = String(track.minute_local).padStart(2, "0");
  const suffix = track.hour_local < 12 ? "AM" : "PM";
  return `${hour}:${minute} ${suffix}`;
}

async function portalRequest<T>(path: string, session: Session): Promise<T> {
  const response = await fetch(`${PORTAL_API}${path}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) throw new Error(String(response.status));
  return data;
}

export default function Member() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!session) {
      setMember(null);
      return;
    }

    setMemberLoading(true);
    setError("");
    void portalRequest<MemberData>("/me", session)
      .then((data) => {
        if (alive) setMember(data);
      })
      .catch(() => {
        if (alive) setError("We could not load your member space just now. Please refresh and try again.");
      })
      .finally(() => {
        if (alive) setMemberLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [session]);

  const activeTracks = useMemo(
    () => (member?.schedules ?? []).filter((track) => track.active),
    [member?.schedules],
  );

  const primaryTrack = activeTracks[0] ?? null;
  const maxDay = activeTracks.reduce((max, track) => Math.max(max, track.journey_day ?? 0), 0);
  const bestProgress = activeTracks
    .map((track) => track.progress?.pct ?? 0)
    .reduce((max, pct) => Math.max(max, pct), 0);

  const firstName =
    primaryTrack?.caller_name?.trim().split(/\s+/)[0] ||
    member?.caller_name?.trim().split(/\s+/)[0] ||
    "";

  const sendMagicLink = async () => {
    if (!email.trim()) return;
    setMessage("");
    setError("");

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Check your email. The sign-in link will bring you back to this room.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMember(null);
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
        title="Return to the thread — not to a dashboard."
        description="Your member space is being rebuilt around continuity: what you are walking through, the Scripture you have visited, the next journey waiting for you, and what you want the guide to remember."
        compact
      >
        <section className="mx-auto max-w-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold">Sign in by email</p>
          <h2 className="font-serif-display mt-3 text-3xl font-light text-parchment">No password. Just a private link.</h2>
          <p className="mt-3 text-[12px] font-light leading-[1.75] text-parchment-dim">
            Enter the email connected to your membership. We will send a one-time sign-in link and bring you back here.
          </p>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-6 w-full border border-white/12 bg-white/[0.025] px-4 py-3.5 text-parchment outline-none placeholder:text-parchment-dim/45 focus:border-gold-soft"
          />
          {message && <p className="mt-4 text-[12px] leading-relaxed text-gold-bright">{message}</p>}
          {error && <p className="mt-4 text-[12px] leading-relaxed text-[#e1a695]">{error}</p>}
          <button
            type="button"
            onClick={sendMagicLink}
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
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Today</p>
            <h1 className="font-serif-display mt-4 text-5xl font-light leading-none text-parchment sm:text-6xl">
              {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
            </h1>
            <p className="mt-4 text-[13px] font-light leading-relaxed text-parchment-dim">
              {member?.email ?? session.user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 self-start text-[10px] font-medium uppercase tracking-[0.2em] text-parchment-dim transition-colors hover:text-gold-bright"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </section>

        {memberLoading ? (
          <p className="font-serif-display py-12 text-center text-2xl font-light italic text-parchment-dim">Gathering your journey…</p>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border border-gold-soft/35 bg-[hsl(var(--gold)/0.055)] p-7 sm:p-9">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold">Today at the Well</p>
                {primaryTrack ? (
                  <>
                    <h2 className="font-serif-display mt-4 text-4xl font-light text-parchment">
                      {MODE_NAMES[primaryTrack.mode] ?? primaryTrack.mode}
                    </h2>
                    <p className="font-serif-display mt-5 text-2xl font-light italic leading-relaxed text-gold-bright">
                      {primaryTrack.progress?.next ?? "Your next conversation is waiting."}
                    </p>
                    <p className="mt-4 text-[12px] font-light leading-relaxed text-parchment-dim">
                      {formatTrackTime(primaryTrack)}{primaryTrack.days ? ` · ${primaryTrack.days}` : ""}
                      {primaryTrack.progress?.label ? ` · ${primaryTrack.progress.label}` : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif-display mt-4 text-4xl font-light text-parchment">Nothing is scheduled yet.</h2>
                    <p className="mt-4 text-[13px] font-light leading-[1.8] text-parchment-dim">
                      Your room should never manufacture urgency. Start a conversation now, or choose a recurring journey after the scheduling controls move into this shared app.
                    </p>
                  </>
                )}
                <a
                  href={PHONE_TEL}
                  className="mt-7 inline-flex items-center gap-3 bg-[hsl(var(--gold))] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#17120a] transition-colors hover:bg-[hsl(var(--gold-bright))]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Start a conversation
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Metric value={String(member?.total_calls ?? 0)} label="Calls" />
                <Metric value={String(maxDay)} label="Days walked" />
                <Metric value={`${Math.round(bestProgress)}%`} label="Bible progress" />
                <Metric value={String(activeTracks.length)} label="Active journeys" />
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Your journeys</p>
                  <h2 className="font-serif-display mt-3 text-3xl font-light text-parchment">The rhythms you asked to keep.</h2>
                </div>
                <CalendarClock className="h-5 w-5 text-gold" />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {activeTracks.length ? (
                  activeTracks.map((track) => (
                    <article key={`${track.mode}-${track.hour_local}-${track.minute_local}`} className="border border-white/10 bg-white/[0.02] p-5">
                      <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-gold">{MODE_NAMES[track.mode] ?? track.mode}</p>
                      <h3 className="font-serif-display mt-3 text-2xl font-light text-parchment">
                        {track.progress?.next ?? "Your next conversation"}
                      </h3>
                      <p className="mt-3 text-[11px] font-light leading-relaxed text-parchment-dim">
                        {formatTrackTime(track)}{track.days ? ` · ${track.days}` : ""}
                      </p>
                      {track.progress?.pct != null && (
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-[hsl(var(--gold))]"
                            style={{ width: `${Math.max(0, Math.min(track.progress.pct, 100))}%` }}
                          />
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="border border-dashed border-white/12 p-6 text-[13px] font-light leading-[1.8] text-parchment-dim md:col-span-2">
                    No recurring journey is active yet. Scheduling is the next member feature being moved out of the legacy portal and into this shared app.
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Your phone</p>
                    <h2 className="font-serif-display mt-2 text-2xl font-light text-parchment">
                      {member?.phone ? member.phone : "No number connected"}
                    </h2>
                    <p className="mt-2 text-[11px] font-light leading-relaxed text-parchment-dim">
                      {member?.phone_verified
                        ? "Verified for member calling and scheduled experiences."
                        : member?.phone
                          ? "This number still needs verification before scheduled calls can use it."
                          : "Phone setup and verification are being moved into this React member flow next."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Recent conversations</p>
                    <h2 className="font-serif-display mt-2 text-2xl font-light text-parchment">Your story should read like a journey, not a transcript archive.</h2>
                  </div>
                  <BookOpen className="mt-1 h-4 w-4 shrink-0 text-gold" />
                </div>

                <div className="mt-5 space-y-4">
                  {(member?.history ?? []).slice(0, 4).map((item, index) => (
                    <article key={`${item.created_at}-${index}`} className="border-t border-white/8 pt-4 first:border-t-0 first:pt-0">
                      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-parchment-dim">
                        {(item.created_at ?? "").slice(0, 10)}
                        {item.figure_name ? ` · Story visited: ${item.figure_name}` : ""}
                      </p>
                      <p className="mt-2 text-[12px] font-light leading-[1.7] text-parchment/85">
                        {item.summary?.slice(0, 180) || "Conversation completed."}
                      </p>
                    </article>
                  ))}
                  {!member?.history?.length && (
                    <p className="text-[12px] font-light leading-relaxed text-parchment-dim">Your completed conversations will appear here as brief summaries you can recognize later.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row">
              <a
                href="/gift/"
                className="inline-flex flex-1 items-center justify-center gap-3 border border-gold-soft px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-bright transition-colors hover:bg-[hsl(var(--gold)/0.08)]"
              >
                <Gift className="h-3.5 w-3.5" />
                Gift a conversation
              </a>
              <a
                href="/about/"
                className="group inline-flex flex-1 items-center justify-center gap-3 border border-white/10 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-parchment-dim transition-colors hover:border-gold-soft hover:text-gold-bright"
              >
                Why El Roi
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </section>
          </>
        )}

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
