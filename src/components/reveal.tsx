import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    // Animations disabled (OS setting, battery saver, embedded previews):
    // render fully visible so content is never hidden behind a stalled reveal.
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: Math.min(delay, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-serif-display mt-5 text-4xl font-light leading-[1.08] text-parchment sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {copy && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-[15px] font-light leading-relaxed text-parchment-dim">
            {copy}
          </p>
        </Reveal>
      )}
    </div>
  );
}

export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold)/0.35)] to-transparent ${className}`}
    />
  );
}
