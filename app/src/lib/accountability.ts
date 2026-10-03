export type AccountabilityAppId =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "spotify"
  | "reddit"
  | "x";

export type AccountabilityGoal = {
  enabled: boolean;
  dailyMinutes: number;
};

export type AccountabilitySettings = {
  enabled: boolean;
  quietUntilTomorrow: boolean;
  apps: Record<AccountabilityAppId, AccountabilityGoal>;
  replacements: {
    cinema: boolean;
    scripture: boolean;
    prayer: boolean;
    worship: boolean;
    talk: boolean;
  };
};

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

const STORAGE_KEY = "elroi.walk-with-me.v1";

export const DEFAULT_ACCOUNTABILITY_SETTINGS: AccountabilitySettings = {
  enabled: false,
  quietUntilTomorrow: false,
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

export function loadAccountabilitySettings(): AccountabilitySettings {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTABILITY_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCOUNTABILITY_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AccountabilitySettings>;
    return {
      ...DEFAULT_ACCOUNTABILITY_SETTINGS,
      ...parsed,
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

export function gentleAccountabilityMessage(
  appLabel: string,
  minutes: number,
  goal: number
) {
  return {
    title: "Still doing what you came here for?",
    body: `You wanted to keep ${appLabel} around ${goal} minutes today. You’re at about ${minutes}. Want to switch gears?`,
  };
}
