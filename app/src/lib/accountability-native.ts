import { Capacitor, registerPlugin } from "@capacitor/core";

export type AccountabilityPermissionStatus = {
  platform: "android" | "ios" | "web";
  supported: boolean;
  granted: boolean;
  detail?: string;
};

type UsageResult = {
  minutes: Record<string, number>;
};

interface AccountabilityNativePlugin {
  getStatus(): Promise<AccountabilityPermissionStatus>;
  openUsageAccessSettings(): Promise<void>;
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

export async function getAndroidUsage(packages: string[]) {
  if (Capacitor.getPlatform() !== "android") return { minutes: {} };
  return NativeAccountability.getUsage({ packages });
}
