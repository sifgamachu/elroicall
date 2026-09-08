import { Component } from "react";
import type { ReactNode } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

export default class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f9fc] px-6 text-parchment">
        <section role="alert" className="max-w-lg py-12 text-center">
          <h1 className="font-serif-display text-4xl">We could not open this page.</h1>
          <p className="mt-5 text-base leading-relaxed text-parchment-dim">You can still reach El Roi by phone. Reloading may help, but it will clear any unsubmitted draft.</p>
          <a href={PHONE_TEL} className="mt-7 inline-flex bg-[hsl(var(--gold))] px-6 py-4 font-semibold text-white">Call {PHONE_DISPLAY}</a>
          <button type="button" onClick={() => window.location.reload()} className="mx-auto mt-4 block min-h-11 text-gold-bright underline">Reload page</button>
        </section>
      </main>
    );
  }
}
