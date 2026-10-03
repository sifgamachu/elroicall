import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  BellRing,
  Check,
  ChevronRight,
  EyeOff,
  HeartHandshake,
  Pause,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  ACCOUNTABILITY_APPS,
  gentleAccountabilityMessage,
  loadAccountabilitySettings,
  saveAccountabilitySettings,
  type AccountabilitySettings,
} from "@/lib/accountability";
import {
  accountabilityPermissionStatus,
  getAndroidUsage,
  openAndroidUsageAccess,
  type AccountabilityPermissionStatus,
} from "@/lib/accountability-native";
import "@/walk-with-me.css";

export default function WalkWithMe() {
  const [settings, setSettings] = useState<AccountabilitySettings>(() =>
    loadAccountabilitySettings()
  );
  const [status, setStatus] = useState<AccountabilityPermissionStatus | null>(
    null
  );
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    void refreshStatus();
  }, []);

  const selected = useMemo(
    () => ACCOUNTABILITY_APPS.filter(app => settings.apps[app.id].enabled),
    [settings.apps]
  );

  function commit(next: AccountabilitySettings) {
    setSettings(next);
    saveAccountabilitySettings(next);
  }

  async function refreshStatus() {
    setStatus(await accountabilityPermissionStatus());
  }

  async function refreshUsage() {
    const packages = selected.map(app => app.androidPackage);
    if (!packages.length) {
      setMessage("Choose at least one app first.");
      return;
    }
    const result = await getAndroidUsage(packages);
    setUsage(result.minutes);
    setMessage("Today’s usage refreshed on this device.");
  }

  const firstOverGoal = selected.find(app => {
    const minutes = usage[app.androidPackage] || 0;
    return minutes >= settings.apps[app.id].dailyMinutes;
  });

  const prompt = firstOverGoal
    ? gentleAccountabilityMessage(
        firstOverGoal.label,
        usage[firstOverGoal.androidPackage] || 0,
        settings.apps[firstOverGoal.id].dailyMinutes
      )
    : null;

  return (
    <div className="wwm">
      <section className="wwm-hero">
        <span className="wwm-icon"><HeartHandshake size={24} /></span>
        <div>
          <p className="erc-eyebrow">WALK WITH ME</p>
          <h1>Accountability without judgment.</h1>
          <p>
            You choose what you want help protecting. Elroi Calls reminds you
            of your own intention and always leaves the decision with you.
          </p>
        </div>
      </section>

      <section className="wwm-card">
        <div className="wwm-row">
          <div>
            <h2>Gentle accountability</h2>
            <p>Nothing is watched until you turn this on and choose what matters.</p>
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
          <Smartphone size={20} />
          <div>
            <h2>Choose what you want help with</h2>
            <p>These are your goals, not El Roi’s judgment about an app.</p>
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
                    {typeof minutes === "number" && <small>{minutes} min today</small>}
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
                      <option key={value} value={value}>{value} min</option>
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
            <p>Pick what Elroi Calls should offer when you want to reset.</p>
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
                checked={settings.replacements[key as keyof typeof settings.replacements]}
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
            <h2>Phone activity permission</h2>
            <p>
              Usage stays on this device in this first version. Elroi Calls
              does not upload a history of which apps you used.
            </p>
          </div>
        </div>
        <div className="wwm-device">
          <strong>
            {status?.granted
              ? "Connected"
              : status?.platform === "ios"
                ? "iPhone permission not enabled yet"
                : "Not connected"}
          </strong>
          <p>{status?.detail}</p>
          {status?.platform === "android" && !status.granted && (
            <button
              className="erc-button erc-button-gold"
              onClick={() => void openAndroidUsageAccess().then(refreshStatus)}
            >
              Open Android usage access
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
        </div>
      </section>

      {prompt && settings.enabled && !settings.quietUntilTomorrow && (
        <section className="wwm-prompt" aria-live="polite">
          <p className="erc-eyebrow">A GENTLE CHECK-IN</p>
          <h2>{prompt.title}</h2>
          <p>{prompt.body}</p>
          <div className="wwm-actions">
            {settings.replacements.cinema && (
              <Link className="erc-button erc-button-gold" to="/app/cinema/">
                Watch a story <ChevronRight size={17} />
              </Link>
            )}
            {settings.replacements.talk && (
              <Link className="erc-button erc-button-quiet" to="/begin/">
                Talk with El Roi
              </Link>
            )}
            <button
              className="erc-button erc-button-quiet"
              onClick={() =>
                commit({ ...settings, quietUntilTomorrow: true })
              }
            >
              <Pause size={16} /> Don’t remind me again today
            </button>
          </div>
        </section>
      )}

      <section className="wwm-privacy">
        <EyeOff size={19} />
        <div>
          <strong>You stay in control.</strong>
          <p>
            Continue anyway is always allowed. Turn the feature off at any time.
            This first foundation does not inspect messages, audio, photos, or
            the content inside another app.
          </p>
        </div>
      </section>
      <p role="status" className="erc-muted">{message}</p>
    </div>
  );
}
