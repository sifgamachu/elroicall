import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Check, Pause, PhoneCall, Save, ShieldCheck } from "lucide-react";
import type { PortalMember, PortalTrack } from "@/lib/portal";
import { normalizePhone } from "@/lib/phone";
import { portalRequest } from "@/lib/portal";

const MODES = [
  {
    id: "journey",
    title: "The Journey",
    body: "Walk through the whole Bible over one year, with the next part of the story waiting each day.",
  },
  {
    id: "sermon",
    title: "The Pulpit Walk",
    body: "Move through Scripture chapter by chapter with a focused guided reflection on the text for that day.",
  },
  {
    id: "inspiration",
    title: "Daily Check-In",
    body: "A shorter recurring conversation: one story, one Scripture, reflection, and an optional prayer.",
  },
  {
    id: "random",
    title: "Surprise Me",
    body: "The same guide brings a different biblical story or theme each time so familiar passages do not become the whole map.",
  },
] as const;

const TZ_OPTIONS = [
  ["America/New_York", "Eastern"],
  ["America/Chicago", "Central"],
  ["America/Denver", "Mountain"],
  ["America/Phoenix", "Arizona"],
  ["America/Los_Angeles", "Pacific"],
  ["America/Anchorage", "Alaska"],
  ["Pacific/Honolulu", "Hawaii"],
] as const;

type MemberControlsProps = {
  session: Session;
  member: PortalMember;
  onRefresh: () => Promise<void>;
};

type PhoneStage = "set" | "verify" | "verified";

export default function MemberControls({
  session,
  member,
  onRefresh,
}: MemberControlsProps) {
  const firstSchedule = member.schedules?.[0];
  const [phoneStage, setPhoneStage] = useState<PhoneStage>(
    member.phone_verified ? "verified" : member.phone ? "verify" : "set",
  );
  const [phone, setPhone] = useState(member.phone ?? "");
  const [code, setCode] = useState("");
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);

  const [mode, setMode] = useState(firstSchedule?.mode ?? "inspiration");
  const [hour, setHour] = useState(firstSchedule?.hour_local ?? 8);
  const [minute, setMinute] = useState(firstSchedule?.minute_local ?? 0);
  const [timezone, setTimezone] = useState(firstSchedule?.tz ?? "America/New_York");
  const [days, setDays] = useState(firstSchedule?.days ?? "daily");
  const [callerName, setCallerName] = useState(firstSchedule?.caller_name ?? member.caller_name ?? "");
  const [scheduleConsent, setScheduleConsent] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleBusy, setScheduleBusy] = useState(false);

  const activeTracks = (member.schedules ?? []).filter((track) => track.active);

  const requestVerification = async () => {
    if (!normalizePhone(phone) || phoneBusy) return;
    setPhoneBusy(true);
    setPhoneMessage("");
    try {

      const { status, data } = await portalRequest<{
        verify?: string;
        error?: string;
      }>("/phone", session, { phone: normalizePhone(phone) });

      if (status === 409) {
        setPhoneMessage("That number is already connected to another account.");
        return;
      }
      if (status !== 200) {
        setPhoneMessage("That number could not be saved. Check it and try again.");
        return;
      }

      setPhoneStage("verify");
      setPhoneMessage(
        data.verify === "calling"
          ? "Your verification call should be ringing now. Enter the four-digit code you hear."
          : "Your number is saved. If you do not receive a code, request another verification call.",
      );
    } catch {
      setPhoneMessage("We could not confirm the verification call. Check your connection, then try again.");
    } finally {
      setPhoneBusy(false);
    }
  };

  const verifyPhone = async () => {
    if (code.trim().length !== 4 || phoneBusy) return;
    setPhoneBusy(true);
    setPhoneMessage("");
    try {

      const { status, data } = await portalRequest<{
        phone_verified?: boolean;
        error?: string;
      }>("/verify", session, { code: code.trim() });

      if (status === 200 && data.phone_verified) {
        setPhoneStage("verified");
        setPhoneMessage("Verified. Scheduled calls can use this number.");
        await onRefresh();
        return;
      }

      setPhoneMessage(
        data.error === "expired"
          ? "That code expired. Request another verification call."
          : "That code did not match. Listen once more and try again.",
      );
    } catch {
      setPhoneMessage("We could not verify the code just now. Try again.");
    } finally {
      setPhoneBusy(false);
    }
  };

  const saveSchedule = async () => {
    if (scheduleBusy) return;
    if (!member.phone_verified) {
      setScheduleMessage("Verify your phone before scheduling automated calls.");
      return;
    }
    if (!scheduleConsent) {
      setScheduleMessage("Please confirm the automated-call consent before saving.");
      return;
    }

    setScheduleBusy(true);
    setScheduleMessage("");
    try {
      const { status } = await portalRequest("/schedule", session, {
        hour_local: hour,
        minute_local: minute,
        timezone,
        days,
        mode,
        caller_name: callerName.trim(),
        consent: true,
      });

      if (status === 200) {
        setScheduleMessage("Saved. This journey is now part of your rhythm.");
        setScheduleConsent(false);
        await onRefresh();
      } else {
        setScheduleMessage("The schedule could not be saved just now. Try again.");
      }
    } catch {
      setScheduleMessage("We could not confirm whether your schedule was saved. Refresh your room before trying again.");
    } finally {
      setScheduleBusy(false);
    }
  };

  const pauseTrack = async (track: PortalTrack) => {
    if (scheduleBusy) return;
    setScheduleBusy(true);
    setScheduleMessage("");
    try {
      const { status } = await portalRequest("/cancel", session, { mode: track.mode });
      if (status === 200) {
        setScheduleMessage(`${modeName(track.mode)} is paused. Your other journeys are unchanged.`);
        await onRefresh();
      } else {
        setScheduleMessage("That journey could not be paused just now.");
      }
    } catch {
      setScheduleMessage("We could not confirm whether this journey was paused. Refresh your room before trying again.");
    } finally {
      setScheduleBusy(false);
    }
  };

  return (
    <section className="space-y-5 border-t border-slate-200 pt-10">
      <div>
        <p className="eyebrow">Your calling preferences</p>
        <h2 className="font-serif-display mt-3 text-3xl font-normal text-parchment">
          You decide when the line reaches back to you.
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-normal leading-[1.8] text-parchment-dim">
          Verify your phone, choose a time that works for you, and pause scheduled calls whenever you need to.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-medium text-gold">Verified phone</p>
              <h3 className="font-serif-display mt-2 text-2xl font-normal text-parchment">
                {phoneStage === "verified" ? member.phone ?? phone : "Connect your number"}
              </h3>
            </div>
          </div>

          {phoneStage === "set" && (
            <div className="mt-5">
              <label htmlFor="member-phone" className="text-sm font-medium text-parchment-dim">
                Phone number
              </label>
              <input
                id="member-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                disabled={phoneBusy}
                aria-describedby="member-phone-help"
                placeholder="(555) 555-5555"
                className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-parchment outline-none placeholder:text-parchment-dim/40 focus:border-gold-soft"
              />
              <p id="member-phone-help" className="mt-2 text-sm text-parchment-dim">Use your full number, including + and country code outside the U.S. or Canada.</p>
              <button
                type="button"
                onClick={requestVerification}
                disabled={!normalizePhone(phone) || phoneBusy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[hsl(var(--gold))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-35"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {phoneBusy ? "Calling…" : "Call me with a code"}
              </button>
            </div>
          )}

          {phoneStage === "verify" && (
            <div className="mt-5">
              <p className="text-sm font-normal leading-relaxed text-parchment-dim">
                Enter the four-digit code spoken during the verification call.
              </p>
              <input
                aria-label="Four-digit verification code"
                autoComplete="one-time-code"
                disabled={phoneBusy}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="0000"
                className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl tracking-[0.45em] text-parchment outline-none focus:border-gold-soft"
              />
              <button
                type="button"
                onClick={verifyPhone}
                disabled={code.length !== 4 || phoneBusy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[hsl(var(--gold))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-35"
              >
                <Check className="h-3.5 w-3.5" />
                Verify number
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneStage("set");
                  setCode("");
                  setPhoneMessage("");
                }}
                className="mt-3 w-full border border-slate-200 px-4 py-3 text-sm font-medium text-parchment-dim hover:border-gold-soft hover:text-gold-bright"
              >
                Use a different number
              </button>
            </div>
          )}

          {phoneStage === "verified" && (
            <div className="mt-5">
              <p className="flex items-center gap-2 text-sm font-normal text-parchment-dim">
                <Check className="h-3.5 w-3.5 text-gold" />
                Verified for scheduled experiences.
              </p>
              <button
                type="button"
                onClick={() => setPhoneStage("set")}
                className="mt-4 text-sm font-medium text-parchment-dim hover:text-gold-bright"
              >
                Change number
              </button>
            </div>
          )}

          {phoneMessage && (
            <p role="status" className="mt-4 text-sm font-normal leading-relaxed text-parchment-dim">
              {phoneMessage}
            </p>
          )}
        </article>

        <article className="border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-gold">Schedule a journey</p>
          <h3 className="font-serif-display mt-2 text-2xl font-normal text-parchment">
            Make time for reflection.
          </h3>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={`border p-4 text-left transition-colors ${
                  mode === option.id
                    ? "border-gold-soft bg-indigo-50"
                    : "border-slate-200 bg-slate-50 hover:border-gold-soft/60"
                }`}
              >
                <span className="font-serif-display block text-xl font-normal text-parchment">
                  {option.title}
                </span>
                <span className="mt-2 block text-sm font-normal leading-relaxed text-parchment-dim">
                  {option.body}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Hour">
              <select value={hour} onChange={(event) => setHour(Number(event.target.value))} className={selectClass}>
                {Array.from({ length: 24 }, (_, value) => {
                  const display = value % 12 || 12;
                  return (
                    <option key={value} value={value}>
                      {display}:00 {value < 12 ? "AM" : "PM"}
                    </option>
                  );
                })}
              </select>
            </Field>
            <Field label="Minute">
              <select value={minute} onChange={(event) => setMinute(Number(event.target.value))} className={selectClass}>
                {[0, 15, 30, 45].map((value) => (
                  <option key={value} value={value}>:{String(value).padStart(2, "0")}</option>
                ))}
              </select>
            </Field>
            <Field label="Days">
              <select value={days} onChange={(event) => setDays(event.target.value)} className={selectClass}>
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select value={timezone} onChange={(event) => setTimezone(event.target.value)} className={selectClass}>
                {TZ_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="What should the guide call you?">
            <input
              value={callerName}
              onChange={(event) => setCallerName(event.target.value)}
              maxLength={60}
              placeholder="First name is enough"
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-parchment outline-none placeholder:text-parchment-dim/40 focus:border-gold-soft"
            />
          </Field>

          <label className="mt-5 flex cursor-pointer items-start gap-3 border border-slate-200 bg-slate-50 p-4 text-sm font-normal leading-[1.7] text-parchment-dim">
            <input
              type="checkbox"
              checked={scheduleConsent}
              onChange={(event) => setScheduleConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(var(--gold))]"
            />
            <span>
              I want El Roi Call to place automated calls to my verified number at the schedule I chose. I can pause a journey or opt out later. Consent is not a condition of purchase; message/data or carrier charges may apply where relevant.
            </span>
          </label>

          <button
            type="button"
            onClick={saveSchedule}
            disabled={scheduleBusy || !member.phone_verified}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[hsl(var(--gold))] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-35"
          >
            <Save className="h-3.5 w-3.5" />
            {scheduleBusy ? "Saving…" : "Save this journey"}
          </button>

          {scheduleMessage && (
            <p role="status" className="mt-4 text-sm font-normal leading-relaxed text-parchment-dim">
              {scheduleMessage}
            </p>
          )}
        </article>
      </div>

      {activeTracks.length > 0 && (
        <div className="border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-gold">Active journeys</p>
          <div className="mt-3 divide-y divide-white/[0.08]">
            {activeTracks.map((track) => (
              <div key={track.mode} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-serif-display text-lg font-normal text-parchment">{modeName(track.mode)}</p>
                  <p className="mt-1 text-sm font-normal text-parchment-dim">
                    {track.hour_local == null ? "Scheduled" : formatTime(track)}{track.days ? ` · ${track.days}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => pauseTrack(track)}
                  disabled={scheduleBusy}
                  className="inline-flex items-center gap-2 text-sm font-medium text-parchment-dim hover:text-gold-bright disabled:opacity-35"
                >
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block text-sm font-medium text-parchment-dim">
      {label}
      {children}
    </label>
  );
}

function modeName(mode: string) {
  return MODES.find((item) => item.id === mode)?.title ?? mode;
}

function formatTime(track: PortalTrack) {
  if (track.hour_local == null || track.minute_local == null) return "Scheduled";
  const hour = track.hour_local % 12 || 12;
  return `${hour}:${String(track.minute_local).padStart(2, "0")} ${track.hour_local < 12 ? "AM" : "PM"}`;
}

const selectClass =
  "mt-2 w-full border border-slate-200 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-parchment outline-none focus:border-gold-soft";
