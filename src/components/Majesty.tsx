import { motion, useReducedMotion } from "framer-motion";

/**
 * Majesty — a breath of God's power between sections.
 *
 * A thin shaft of light opens across the page as it scrolls into view,
 * like glory breaking through. Pure presence — no words, just the sense
 * of something vast passing by.
 */
export default function Majesty({ quote, reference }: { quote?: string; reference?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative overflow-hidden py-16 sm:py-20">
      {/* the shaft of light opening */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
        initial={reduced ? { opacity: 0.4 } : { scaleX: 0, opacity: 0 }}
        whileInView={reduced ? { opacity: 0.4 } : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--gold-bright)/0.6) 30%, hsl(var(--glory)/0.8) 50%, hsl(var(--gold-bright)/0.6) 70%, transparent)",
          boxShadow: "0 0 40px 2px hsl(var(--gold-bright)/0.3)",
        }}
      />
      {/* the glow blooming around it */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 2, delay: 0.3 }}
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, hsl(var(--gold-bright)/0.08), transparent 70%)",
        }}
      />
      {quote && (
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <motion.p
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-display text-xl font-light italic leading-[1.8] text-parchment/90 sm:text-2xl"
          >
            "{quote}"
          </motion.p>
          {reference && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-4 text-[10px] font-medium uppercase tracking-[0.4em] text-gold"
            >
              {reference}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
