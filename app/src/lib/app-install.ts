import { isAppShell, isNativeApp } from "./native";

type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type AppInstallState = { installed: boolean; available: boolean };
let deferredPrompt: InstallPrompt | null = null;
let listening = false;
let installationAccepted = false;
const subscribers = new Set<(state: AppInstallState) => void>();
export function appInstallState(): AppInstallState {
  return {
    installed: isAppShell() || installationAccepted,
    available: Boolean(deferredPrompt),
  };
}
function notifyInstallState() {
  const state = appInstallState();
  subscribers.forEach(subscriber => subscriber(state));
}
export function watchAppInstall(subscriber: (state: AppInstallState) => void) {
  if (!listening && !isNativeApp()) {
    listening = true;
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredPrompt = event as InstallPrompt;
      notifyInstallState();
    });
    window.addEventListener("appinstalled", () => {
      installationAccepted = true;
      deferredPrompt = null;
      notifyInstallState();
    });
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", notifyInstallState);
  }
  subscribers.add(subscriber);
  subscriber(appInstallState());
  return () => {
    subscribers.delete(subscriber);
  };
}
export async function promptAppInstall() {
  const prompt = deferredPrompt;
  if (!prompt) return null;
  // Browsers allow each captured prompt to be used only once.
  deferredPrompt = null;
  notifyInstallState();
  await prompt.prompt();
  return (await prompt.userChoice).outcome;
}

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
