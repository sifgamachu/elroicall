import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Magnetic — the button leans toward the cursor, as if drawn to you.
 *
 * A hallmark of high-end sites: interactive elements respond to proximity,
 * not just contact. The inner content shifts slightly more than the shell,
 * creating a soft, physical depth. Disabled under reduced-motion.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    setPos({ x, y });
  };

  const onLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 180, damping: 16, mass: 0.4 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
