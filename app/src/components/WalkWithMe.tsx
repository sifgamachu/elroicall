import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BellRing,
  BookOpen,
  Check,
  ChevronRight,
  Clapperboard,
  EyeOff,
  HeartHandshake,
  MessageCircle,
  Pause,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  ACCOUNTABILITY_APPS,
  ACCOUNTABILITY_INTENTIONS,
  gentleAccountabilityMessage,
  isSnoozedToday,
  loadAccountabilitySettings,
  localDayKey,
  saveAccountabilitySettings,
  type AccountabilitySettings,
} from "@/lib/accountability";
import {
  accountabilityPermissionStatus,
  configureAndroidAccountability,
  getAndroidUsage,
  openAndroidUsageAccess,
  requestAndroidAccountabilityNotifications,
  snoozeAndroidAccountabilityToday,
  type AccountabilityPermissionStatus,
} from "@/lib/accountability-native";
import "@/walk-with-me.css";

export default function WalkWithMe() {
  const location = useLocation();
  const [settings, setSettings] = useState<AccountabilitySettings>(() =>
    loadAccountabilitySettings()
  );
  const [status, setStatus] = useState<AccountabilityPermissionStatus | null>(
    null
  );
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const openedFromCheckIn =
    new URLSearchParams(location.search).get("checkin") === "1";

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void accountabilityPermissionStatus().then(next => {
        if (active) setStatus(next);
      });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const selected = useMemo(
    () => ACCOUNTABILITY_APPS.filter(app => settings.apps[app.id].enabled),
    [settings.apps]
  );

  function commit(next: AccountabilitySettings) {
    setSettings(next);
    saveAccountabilitySettings(next);
    void configureAndroidAccountability(next)
      .then(nextStatus => setStatus(nextStatus))
      .catch(() => {});
  }

  async function refreshStatus() {
    let next = await accountabilityPermissionStatus();
    if (next.platform === "android" && next.granted) {
      next = await configureAndroidAccountability(settings);
    }
    setStatus(next);
  }

  async function refreshUsage() {
    const packages = selected.map(app => app.androidPackage);
    if (!packages.length) {
      setMessage("Choose at least one app first.");
      return;
    }
    try {
      const result = await getAndroidUsage(packages);
      setUsage(result.minutes);
      setMessage("Today’s usage refreshed on this device.");
    } catch {
      setMessage("Usage could not be checked. Confirm Android Usage Access first.");
    }
  }

  async function enableNotifications() {
    const next = await requestAndroidAccountabilityNotifications();
    setStatus(next);
    if (next.notificationsGranted) {
      setMessage("Gentle background check-ins are allowed on this device.");
    }
  }

  function snoozeToday() {
    const next = { ...settings, snoozedDate: localDayKey() };
    commit(next);
    void snoozeAndroidAccountabilityToday();
    setMessage("No more Walk With Me reminders today.");
  }

  const firstOverGoal = selected.find(app => {
    const minutes = usage[app.androidPackage] || 0;
    return minutes >= settings.apps[app.id].dailyMinutes;
  });

  const prompt = firstOverGoal
    ? gentleAccountabilityMessage(
        firstOverGoal.label,
        usage[firstOverGoal.androidPackage] || 0,
        settings.apps[firstOverGoal.id].dailyMinutes,
        settings.intention
      )
    : null;

  const nativeReady =
    status?.platform === "android" &&
    status.granted &&
    status.notificationsGranted &&
    settings.enabled &&
    selected.length > 0;

  return (
    <div className="wwm">
      <section className="wwm-hero">
        <span className="wwm-icon">
          <HeartHandshake size={24} />
        </span>
        <div>
          <p className="erc-eyebrow">WALK WITH ME</p>
          <h1>Accountability without judgment.</h1>
          <p>
            You choose the direction. Elroi Calls simply reminds you of what
            you said mattered and offers an easier way back.
          </p>
        </div>
      </section>

      {openedFromCheckIn && (
        <section className="wwm-prompt" aria-labelledby="wwm-reset-title">
          <p className="erc-eyebrow">YOUR RESET IS READY</p>
          <h2 id="wwm-reset-title">Want to switch gears?</h2>
          <p>
            No lecture. No lost streak. Choose what would be useful right now,
            or keep going with your day.
          </p>
          <ResetActions settings={settings} />
        </section>
      )}

      <section className="wwm-card">
        <div className="wwm-row">
          <div>
            <h2>Gentle accountability</h2>
            <p>
              Nothing is monitored until you turn this on and choose what you
              want help with.
            </p>
          </div>
          <label className="wwm-switch">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={event =>
                commit({ ...settings, enabled: event.target.checked })
              }
            />
            <span>{settings.enabled ? "On" : "Off"}</span>
          </label>
        </div>
      </section>

      <section className="wwm-card">
        <div className="wwm-heading">
          <HeartHandshake size={20} />
          <div>
            <h2>What are you trying to protect?</h2>
            <p>The reminder should sound like your intention, not our judgment.</p>
          </div>
        </div>
        <select
          className="wwm-intention"
          aria-label="Your Walk With Me intention"
          value={settings.intention}
          onChange={event =>
            commit({
              ...settings,
              intention: event.target.value as AccountabilitySettings["intention"],
            })
          }
        >
          {ACCOUNTABILITY_INTENTIONS.map(item => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      <section className="wwm-card">
        <div className="wwm-heading">
          <Smartphone size={20} />
          <div>
            <h2>Choose what you want help with</h2>
            <p>These are your goals. ELROICALL does not label an app good or bad.</p>
          </div>
        </div>
        <div className="wwm-apps">
          {ACCOUNTABILITY_APPS.map(app => {
            const goal = settings.apps[app.id];
            const minutes = usage[app.androidPackage];
            return (
              <div className="wwm-app" key={app.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={goal.enabled}
                    onChange={event =>
                      commit({
                        ...settings,
                        apps: {
                          ...settings.apps,
                          [app.id]: { ...goal, enabled: event.target.checked },
                        },
                      })
                    }
                  />
                  <span>
                    <strong>{app.label}</strong>
                    {typeof minutes === "number" && (
                      <small>{minutes} min today</small>
                    )}
                  </span>
                </label>
                <div className="wwm-limit">
                  <span>Remind me around</span>
                  <select
                    aria-label={`Daily goal for ${app.label}`}
                    value={goal.dailyMinutes}
                    disabled={!goal.enabled}
                    onChange={event =>
                      commit({
                        ...settings,
                        apps: {
                          ...settings.apps,
                          [app.id]: {
                            ...goal,
                            dailyMinutes: Number(event.target.value),
                          },
                        },
                      })
                    }
                  >
                    {[10, 15, 20, 30, 45, 60, 90, 120].map(value => (
                      <option key={value} value={value}>
                        {value} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="wwm-card">
        <div className="wwm-heading">
          <Sparkles size={20} />
          <div>
            <h2>Offer something better, not a lecture</h2>
            <p>Pick what ELROICALL should offer when you want to reset.</p>
          </div>
        </div>
        <div className="wwm-options">
          {[
            ["cinema", "A Bible Cinema story"],
            ["scripture", "A short Scripture reading"],
            ["prayer", "A quiet prayer moment"],
            ["worship", "Worship music"],
            ["talk", "Talk with El Roi"],
          ].map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={
                  settings.replacements[
                    key as keyof typeof settings.replacements
                  ]
                }
                onChange={event =>
                  commit({
                    ...settings,
                    replacements: {
                      ...settings.replacements,
                      [key]: event.target.checked,
                    },
                  })
                }
              />
              <Check size={17} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="wwm-card">
        <div className="wwm-heading">
          <BellRing size={20} />
          <div>
            <h2>Phone activity & gentle reminders</h2>
            <p>
              Android checks only the usage totals for apps you selected.
              Background check-ins are intentionally periodic, not constant.
            </p>
          </div>
        </div>
        <div className="wwm-device">
          <strong>
            {nativeReady
              ? "Background check-ins are ready"
              : status?.granted
                ? "Usage access connected"
                : status?.platform === "ios"
                  ? "iPhone Screen Time permission is not enabled yet"
                  : "Phone activity is not connected"}
          </strong>
          <p>{status?.detail}</p>

          {status?.platform === "android" && !status.granted && (
            <button
              className="erc-button erc-button-gold"
              onClick={() => void openAndroidUsageAccess()}
            >
              Open Android Usage Access
            </button>
          )}

          {status?.platform === "android" &&
            status.granted &&
            !status.notificationsGranted && (
              <button
                className="erc-button erc-button-gold"
                onClick={() => void enableNotifications()}
              >
                Allow gentle notifications
              </button>
            )}

          {status?.platform === "android" && status.granted && (
            <button
              className="erc-button erc-button-quiet"
              onClick={() => void refreshStatus()}
            >
              Refresh permission status
            </button>
          )}

          {status?.platform === "android" && status.granted && (
            <button
              className="erc-button erc-button-quiet"
              onClick={() => void refreshUsage()}
            >
              Check today’s usage
            </button>
          )}

          {nativeReady && (
            <p className="wwm-ready">
              <Check size={16} /> ELROICALL may send one quiet background
              check-in after a selected daily goal is reached. It will not
              repeatedly nag you throughout the day.
            </p>
          )}
        </div>
      </section>

      {prompt && settings.enabled && !isSnoozedToday(settings) && (
        <section className="wwm-prompt" aria-live="polite">
          <p className="erc-eyebrow">A GENTLE CHECK-IN</p>
          <h2>{prompt.title}</h2>
          <p>{prompt.body}</p>
          <ResetActions settings={settings} />
          <button
            className="erc-button erc-button-quiet"
            onClick={snoozeToday}
          >
            <Pause size={16} /> Don’t remind me again today
          </button>
        </section>
      )}

      {isSnoozedToday(settings) && (
        <section className="wwm-snoozed">
          <Pause size={18} />
          <span>Walk With Me is quiet for the rest of today.</span>
        </section>
      )}

      <section className="wwm-privacy">
        <EyeOff size={19} />
        <div>
          <strong>You stay in control.</strong>
          <p>
            Continue anyway is always allowed. Turn the feature off at any
            time. Walk With Me does not inspect messages, audio, photos, search
            terms, or the content inside another app.
          </p>
        </div>
      </section>
      <p role="status" className="erc-muted">
        {message}
      </p>
    </div>
  );
}

function ResetActions({ settings }: { settings: AccountabilitySettings }) {
  return (
    <div className="wwm-actions">
      {settings.replacements.cinema && (
        <Link className="erc-button erc-button-gold" to="/app/cinema/">
          <Clapperboard size={17} /> Watch a Bible story
        </Link>
      )}
      {settings.replacements.scripture && (
        <Link className="erc-button erc-button-quiet" to="/app/study/">
          <BookOpen size={17} /> Read today’s Scripture
        </Link>
      )}
      {(settings.replacements.prayer || settings.replacements.talk) && (
        <Link className="erc-button erc-button-quiet" to="/begin/">
          <MessageCircle size={17} /> Talk with El Roi
        </Link>
      )}
      <Link className="wwm-continue" to="/app/">
        Continue without changing anything <ChevronRight size={16} />
      </Link>
    </div>
  );
}
