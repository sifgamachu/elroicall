import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  ACCOUNTABILITY_APPS,
  ACCOUNTABILITY_INTENTIONS,
  type AccountabilitySettings,
} from "@/lib/accountability";

export type AccountabilityPermissionStatus = {
  platform: "android" | "ios" | "web";
  supported: boolean;
  granted: boolean;
  notificationsGranted?: boolean;
  monitoringEnabled?: boolean;
  detail?: string;
};

type UsageResult = {
  minutes: Record<string, number>;
};

type NativeGoal = {
  packageName: string;
  label: string;
  minutes: number;
};

interface AccountabilityNativePlugin {
  getStatus(): Promise<AccountabilityPermissionStatus>;
  openUsageAccessSettings(): Promise<void>;
  requestNotifications(): Promise<AccountabilityPermissionStatus>;
  configure(options: {
    enabled: boolean;
    intention: string;
    goals: NativeGoal[];
  }): Promise<AccountabilityPermissionStatus>;
  snoozeToday(): Promise<void>;
  getUsage(options: { packages: string[] }): Promise<UsageResult>;
}

const NativeAccountability =
  registerPlugin<AccountabilityNativePlugin>("Accountability");

export async function accountabilityPermissionStatus(): Promise<AccountabilityPermissionStatus> {
  const platform = Capacitor.getPlatform() as "android" | "ios" | "web";
  if (!Capacitor.isNativePlatform()) {
    return {
      platform: "web",
      supported: false,
      granted: false,
      detail: "Phone activity access is available only in the installed mobile app.",
    };
  }
  if (platform === "ios") {
    return {
      platform: "ios",
      supported: false,
      granted: false,
      detail:
        "iPhone Screen Time access is staged for the Apple Family Controls entitlement.",
    };
  }
  try {
    return await NativeAccountability.getStatus();
  } catch {
    return {
      platform,
      supported: false,
      granted: false,
      detail: "Device activity access is not available in this build yet.",
    };
  }
}

export async function openAndroidUsageAccess() {
  if (Capacitor.getPlatform() !== "android") return;
  await NativeAccountability.openUsageAccessSettings();
}

export async function requestAndroidAccountabilityNotifications() {
  if (Capacitor.getPlatform() !== "android")
    return accountabilityPermissionStatus();
  return NativeAccountability.requestNotifications();
}

export async function configureAndroidAccountability(
  settings: AccountabilitySettings
) {
  if (Capacitor.getPlatform() !== "android")
    return accountabilityPermissionStatus();
  const goals = ACCOUNTABILITY_APPS.filter(app => settings.apps[app.id].enabled).map(
    app => ({
      packageName: app.androidPackage,
      label: app.label,
      minutes: settings.apps[app.id].dailyMinutes,
    })
  );
  const intention =
    ACCOUNTABILITY_INTENTIONS.find(item => item.id === settings.intention)?.reminder ||
    ACCOUNTABILITY_INTENTIONS[0].reminder;
  return NativeAccountability.configure({
    enabled: settings.enabled,
    intention,
    goals,
  });
}

export async function snoozeAndroidAccountabilityToday() {
  if (Capacitor.getPlatform() !== "android") return;
  await NativeAccountability.snoozeToday();
}

export async function getAndroidUsage(packages: string[]) {
  if (Capacitor.getPlatform() !== "android") return { minutes: {} };
  return NativeAccountability.getUsage({ packages });
}
