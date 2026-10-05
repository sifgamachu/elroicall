export type AccountabilityAppId =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "spotify"
  | "reddit"
  | "x";

export type AccountabilityIntention =
  | "less_scrolling"
  | "scripture_first"
  | "quieter_evenings"
  | "better_listening";

export type AccountabilityGoal = {
  enabled: boolean;
  dailyMinutes: number;
};

export type AccountabilitySettings = {
  enabled: boolean;
  intention: AccountabilityIntention;
  snoozedDate: string | null;
  apps: Record<AccountabilityAppId, AccountabilityGoal>;
  replacements: {
    cinema: boolean;
    scripture: boolean;
    prayer: boolean;
    worship: boolean;
    talk: boolean;
  };
};

export const ACCOUNTABILITY_INTENTIONS: Array<{
  id: AccountabilityIntention;
  label: string;
  reminder: string;
}> = [
  {
    id: "less_scrolling",
    label: "Spend less time scrolling",
    reminder: "You wanted to spend less time scrolling.",
  },
  {
    id: "scripture_first",
    label: "Make room for Scripture",
    reminder: "You wanted to make a little more room for Scripture.",
  },
  {
    id: "quieter_evenings",
    label: "Have quieter evenings",
    reminder: "You wanted your evenings to feel a little quieter.",
  },
  {
    id: "better_listening",
    label: "Choose better things to listen to",
    reminder: "You wanted to be more intentional about what you listen to.",
  },
];

export const ACCOUNTABILITY_APPS: Array<{
  id: AccountabilityAppId;
  label: string;
  androidPackage: string;
}> = [
  { id: "youtube", label: "YouTube", androidPackage: "com.google.android.youtube" },
  { id: "instagram", label: "Instagram", androidPackage: "com.instagram.android" },
  { id: "tiktok", label: "TikTok", androidPackage: "com.zhiliaoapp.musically" },
  { id: "spotify", label: "Spotify", androidPackage: "com.spotify.music" },
  { id: "reddit", label: "Reddit", androidPackage: "com.reddit.frontpage" },
  { id: "x", label: "X", androidPackage: "com.twitter.android" },
];

const STORAGE_KEY = "elroi.walk-with-me.v2";

export const DEFAULT_ACCOUNTABILITY_SETTINGS: AccountabilitySettings = {
  enabled: false,
  intention: "less_scrolling",
  snoozedDate: null,
  apps: {
    youtube: { enabled: false, dailyMinutes: 45 },
    instagram: { enabled: false, dailyMinutes: 30 },
    tiktok: { enabled: false, dailyMinutes: 30 },
    spotify: { enabled: false, dailyMinutes: 60 },
    reddit: { enabled: false, dailyMinutes: 30 },
    x: { enabled: false, dailyMinutes: 30 },
  },
  replacements: {
    cinema: true,
    scripture: true,
    prayer: true,
    worship: false,
    talk: true,
  },
};

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSnoozedToday(
  settings: Pick<AccountabilitySettings, "snoozedDate">,
  date = new Date()
) {
  return settings.snoozedDate === localDayKey(date);
}

export function loadAccountabilitySettings(): AccountabilitySettings {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTABILITY_SETTINGS;
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem("elroi.walk-with-me.v1");
    if (!raw) return DEFAULT_ACCOUNTABILITY_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AccountabilitySettings> & {
      quietUntilTomorrow?: boolean;
    };
    return {
      ...DEFAULT_ACCOUNTABILITY_SETTINGS,
      ...parsed,
      snoozedDate:
        parsed.snoozedDate ||
        (parsed.quietUntilTomorrow ? localDayKey() : null),
      apps: { ...DEFAULT_ACCOUNTABILITY_SETTINGS.apps, ...(parsed.apps || {}) },
      replacements: {
        ...DEFAULT_ACCOUNTABILITY_SETTINGS.replacements,
        ...(parsed.replacements || {}),
      },
    };
  } catch {
    return DEFAULT_ACCOUNTABILITY_SETTINGS;
  }
}

export function saveAccountabilitySettings(settings: AccountabilitySettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function intentionReminder(intention: AccountabilityIntention) {
  return (
    ACCOUNTABILITY_INTENTIONS.find(item => item.id === intention)?.reminder ||
    ACCOUNTABILITY_INTENTIONS[0].reminder
  );
}

export function gentleAccountabilityMessage(
  appLabel: string,
  minutes: number,
  goal: number,
  intention: AccountabilityIntention = "less_scrolling"
) {
  return {
    title: "Still doing what you came here for?",
    body: `${intentionReminder(intention)} You wanted to keep ${appLabel} around ${goal} minutes today. You’re at about ${minutes}. Want to switch gears?`,
  };
}
