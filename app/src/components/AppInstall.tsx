import { useEffect, useState } from "react";
import { Download, Share, Smartphone, Waves } from "lucide-react";
import { isNativeApp } from "@/lib/native";
import {
  appInstallState,
  promptAppInstall,
  watchAppInstall,
} from "@/lib/app-install";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AppInstall() {
  const [state, setState] = useState(appInstallState);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => watchAppInstall(setState), []);
  if (isNativeApp() || state.installed) return null;
  async function install() {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const result = await promptAppInstall();
      setNotice(
        result === "accepted"
          ? "Your browser accepted the request. Look for Elroi Calls on your home screen or in your apps."
          : result === "dismissed"
            ? "You can keep using Elroi Calls here and install it later from your browser menu."
            : "Use the steps below to add Elroi Calls from your browser."
      );
    } catch {
      setNotice(
        "Your browser could not open installation. Use the steps below instead."
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="erc-install-trigger"
          aria-label="Install Elroi Calls"
        >
          <Download size={17} />
          <span>Install app</span>
        </button>
      </DialogTrigger>
      <DialogContent className="erc-install-dialog">
        <div className="erc-install-mark">
          <Waves size={28} />
        </div>
        <DialogTitle>Keep the journey close.</DialogTitle>
        <DialogDescription>
          Add Elroi Calls to your home screen for a direct path to messages,
          Bible study, and your space.
        </DialogDescription>
        {state.available && (
          <button
            className="erc-install-action"
            disabled={busy}
            onClick={() => void install()}
          >
            <Download size={18} />
            {busy ? "Opening your browser…" : "Install on this device"}
          </button>
        )}
        <div className="erc-install-steps">
          <h3>
            <Share size={17} />
            iPhone & iPad
          </h3>
          <ol>
            <li>Open this app in Safari.</li>
            <li>
              Tap Share, in the Page Menu if needed, then{" "}
              <strong>Add to Home Screen</strong>.
            </li>
            <li>
              Turn on <strong>Open as Web App</strong> if shown, then tap{" "}
              <strong>Add</strong>.
            </li>
          </ol>
          <h3>
            <Smartphone size={17} />
            Android & computers
          </h3>
          <p>
            Use your browser’s menu or install icon and choose{" "}
            <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
            Confirm in your browser.
          </p>
        </div>
        <p className="erc-install-note">
          This installs the web app. Films, Scripture links, and account sync
          need an internet connection. Paid store memberships will arrive with
          the native app release.
        </p>
        {notice && (
          <p className="erc-install-notice" role="status">
            {notice}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
