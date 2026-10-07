import { Capacitor } from "@capacitor/core";

export const isNativeApp = () => Capacitor.isNativePlatform();
export const isAppShell = () =>
  isNativeApp() ||
  (typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true));
export function appLinkPath(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" ||
      !["elroicall.com", "elroicall.app"].includes(url.hostname) ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    if (
      !/^\/(app(?:\/|$)|auth\/confirm(?:\/|$)|account(?:\/|$)|schedule(?:\/|$)|begin(?:\/|$)|journey(?:\/|$))/.test(
        url.pathname
      )
    )
      return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}
