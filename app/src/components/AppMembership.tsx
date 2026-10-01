import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, Crown, RefreshCw } from "lucide-react";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import {
  membershipPackages,
  nativeMembershipConfigured,
  purchaseMembership,
  restoreMembership,
} from "@/lib/native-membership";
import { isNativeApp } from "@/lib/native";

export default function AppMembership({ userId }: { userId?: string }) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const ready = nativeMembershipConfigured();
  useEffect(() => {
    if (!userId || !ready) return;
    let alive = true;
    void membershipPackages(userId)
      .then(items => {
        if (alive) setPackages(items);
      })
      .catch(() => {
        if (alive)
          setError(
            "Store plans could not load. Reopen this page to try again."
          );
      });
    return () => {
      alive = false;
    };
  }, [userId, ready]);
  async function act(selected?: PurchasesPackage) {
    if (!userId || busy) return;
    setBusy(selected?.identifier || "restore");
    setNotice("");
    setError("");
    try {
      const result = selected
        ? await purchaseMembership(userId, selected)
        : await restoreMembership(userId);
      const entitlement = result.customerInfo.entitlements.active.elroi_plus;
      setNotice(
        entitlement
          ? "Your membership is recognized. Open a member film to verify playback access."
          : "No active Elroi Plus membership was found for this store account."
      );
    } catch (issue) {
      if (!(
        issue &&
        typeof issue === "object" &&
        "userCancelled" in issue &&
        issue.userCancelled
      ))
        setError(
          "The store could not confirm the purchase. You can restore it here without buying again."
        );
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="erc-membership">
      <div className="erc-membership-art">
        <Crown size={32} />
        <p className="erc-eyebrow">ELROI PLUS</p>
        <h1>
          A deeper journey
          <br />
          through Scripture.
        </h1>
        <p>
          One membership for the private films you publish in the Elroi Calls
          library.
        </p>
      </div>
      <div className="erc-member-content">
        <h2>Enjoy the free library today.</h2>
        <p>
          Messages, the reading plan, and Bible study are open to everyone.
          Member films will appear as they are released.
        </p>
        <ul className="erc-check-list">
          <li>
            <Check size={19} /> Published member films in Bible Cinema
          </li>
          <li>
            <Check size={19} /> The same account on iPhone, iPad, and Android
          </li>
          <li>
            <Check size={19} /> Restore purchases on your store account
          </li>
        </ul>
        {!userId ? (
          <Link
            className="erc-button erc-button-gold"
            to="/account/?mode=signin"
          >
            Sign in to see membership
          </Link>
        ) : !ready ? (
          <div className="erc-note">
            <strong>Memberships are not on sale yet.</strong>
            <p>
              {isNativeApp()
                ? "Store plans will appear here when the release is ready."
                : "Membership purchases will be available in the iPhone and Android apps when they launch."}
            </p>
          </div>
        ) : packages.length ? (
          <div className="erc-plans">
            {packages.map(item => (
              <button
                className="erc-plan"
                key={item.identifier}
                disabled={Boolean(busy)}
                onClick={() => void act(item)}
              >
                <strong>{item.product.title}</strong>
                <span>{item.product.priceString}</span>
                <small>
                  {item.packageType === "ANNUAL"
                    ? "per year"
                    : item.packageType === "MONTHLY"
                      ? "per month"
                      : item.product.description}
                </small>
              </button>
            ))}
            <p className="erc-muted">
              Subscriptions renew automatically at the displayed store price and
              billing period until canceled. Manage or cancel through your Apple
              or Google account. Store confirmation shows any offer terms before
              purchase.
            </p>
          </div>
        ) : (
          <p role="status">No store plans are available yet.</p>
        )}
        {userId && ready && (
          <button
            className="erc-button erc-button-quiet"
            disabled={Boolean(busy)}
            onClick={() => void act()}
          >
            <RefreshCw size={17} />{" "}
            {busy === "restore" ? "Restoring…" : "Restore purchases"}
          </button>
        )}
        {ready && (
          <a
            className="erc-link"
            href={
              isNativeApp() && /iPad|iPhone/.test(navigator.userAgent)
                ? "https://apps.apple.com/account/subscriptions"
                : "https://play.google.com/store/account/subscriptions"
            }
            target="_blank"
            rel="noreferrer"
          >
            Manage store subscription
          </a>
        )}
        <p role="status">{notice}</p>
        {error && (
          <p className="erc-error" role="alert">
            {error}
          </p>
        )}
        <div className="erc-policy">
          <a
            href="https://elroicall.com/terms/"
            target="_blank"
            rel="noreferrer"
          >
            Terms
          </a>
          <a
            href="https://elroicall.com/privacy/"
            target="_blank"
            rel="noreferrer"
          >
            Privacy
          </a>
        </div>
      </div>
    </section>
  );
}
