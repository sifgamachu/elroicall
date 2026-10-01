import { isNativeApp } from "./native";

export function registerAppShell() {
  if (
    !isNativeApp() &&
    window.location.pathname.startsWith("/app") &&
    "serviceWorker" in navigator &&
    window.isSecureContext
  ) {
    void navigator.serviceWorker
      .register("/app-sw.js", { scope: "/" })
      .catch(() => {
        /* App use does not require installation. */
      });
  }
}
