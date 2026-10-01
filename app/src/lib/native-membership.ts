import { Capacitor } from "@capacitor/core";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";

let configured = false;
let owner: string | null = null;
let serial: Promise<unknown> = Promise.resolve();
export function nativeMembershipConfigured() {
  const key =
    Capacitor.getPlatform() === "ios"
      ? import.meta.env.VITE_REVENUECAT_APPLE_KEY
      : import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
  return (
    Capacitor.isNativePlatform() && typeof key === "string" && key.length > 0
  );
}
async function identity(userId: string) {
  if (!nativeMembershipConfigured())
    throw new Error(
      "Membership purchases will open when the store release is ready."
    );
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  if (!configured) {
    const apiKey =
      Capacitor.getPlatform() === "ios"
        ? import.meta.env.VITE_REVENUECAT_APPLE_KEY
        : import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
    await Purchases.configure({ apiKey, appUserID: userId });
    configured = true;
    owner = userId;
  } else if (owner !== userId) {
    await Purchases.logIn({ appUserID: userId });
    owner = userId;
  }
  return Purchases;
}
function withIdentity<T>(
  userId: string,
  action: (sdk: Awaited<ReturnType<typeof identity>>) => Promise<T>
): Promise<T> {
  const result = serial
    .catch(() => {})
    .then(async () => action(await identity(userId)));
  serial = result;
  return result;
}
export function membershipPackages(userId: string) {
  return withIdentity(
    userId,
    async sdk => (await sdk.getOfferings()).current?.availablePackages || []
  );
}
export function purchaseMembership(userId: string, selected: PurchasesPackage) {
  return withIdentity(userId, sdk =>
    sdk.purchasePackage({ aPackage: selected })
  );
}
export function restoreMembership(userId: string) {
  return withIdentity(userId, sdk => sdk.restorePurchases());
}
