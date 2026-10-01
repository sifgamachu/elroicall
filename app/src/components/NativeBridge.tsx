import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isNativeApp, isAppShell, appLinkPath } from "@/lib/native";

export default function NativeBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isAppShell()) document.documentElement.classList.add("elroi-native");
    if (!isNativeApp()) return;
    let alive = true;
    const removers: (() => Promise<void>)[] = [];
    const external = (event: MouseEvent) => {
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target !== "_blank" || event.defaultPrevented)
        return;
      const url = new URL(anchor.href);
      if (url.protocol !== "https:") return;
      event.preventDefault();
      void import("@capacitor/browser")
        .then(({ Browser }) => Browser.open({ url: url.href }))
        .catch(() => {});
    };
    document.addEventListener("click", external);
    const retain = async (
      promise: Promise<{ remove: () => Promise<void> }>
    ) => {
      const handle = await promise;
      if (alive) removers.push(() => handle.remove());
      else await handle.remove();
    };
    void import("@capacitor/app")
      .then(async ({ App }) => {
        if (!alive) return;
        const open = (url: string) => {
          const path = appLinkPath(url);
          if (path && alive) navigate(path);
        };
        const launch = await App.getLaunchUrl();
        if (launch?.url) open(launch.url);
        else if (window.location.pathname === "/")
          navigate("/app/", { replace: true });
        await retain(App.addListener("appUrlOpen", ({ url }) => open(url)));
        await retain(
          App.addListener("backButton", ({ canGoBack }) => {
            if (canGoBack) window.history.back();
            else if (window.location.pathname !== "/app/")
              navigate("/app/", { replace: true });
            else void App.exitApp();
          })
        );
      })
      .catch(() => {
        /* Web navigation and calling remain available. */
      });
    return () => {
      alive = false;
      document.removeEventListener("click", external);
      removers.forEach(remove => {
        void remove();
      });
    };
  }, [navigate]);
  return null;
}
