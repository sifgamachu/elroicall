import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/phone";

/**
 * Floating tap-to-call button. Appears once the visitor scrolls past the
 * hero and stays with them all the way down the page — the number is never
 * more than one tap away.
 */
export default function FloatingCall() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={PHONE_TEL}
          aria-label={`Call El Roi Call at ${PHONE_DISPLAY}`}
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-gold-soft bg-[#faf5e9]/95 py-3 pl-3.5 pr-5 shadow-[0_18px_50px_-12px_rgba(43,33,23,0.4)] backdrop-blur-md transition-colors hover:border-[hsl(var(--gold))]"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--gold))]">
            {!reduced && (
              <span className="breathe absolute inset-0 rounded-full bg-[hsl(var(--gold)/0.5)]" />
            )}
            <Phone className="relative h-[18px] w-[18px] text-[#1a1409] transition-transform duration-300 group-hover:rotate-12" />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.3em] text-gold">
              Free first call
            </span>
            <span className="block text-[13px] font-medium tracking-[0.08em] text-parchment">
              {PHONE_DISPLAY}
            </span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
