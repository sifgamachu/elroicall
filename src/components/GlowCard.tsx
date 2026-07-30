import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * GlowCard — a surface whose inner light follows the cursor.
 *
 * The gold glow tracks the pointer across the card, and the card tilts
 * almost imperceptibly toward it — the sense that the surface is alive
 * and aware of you. Pure CSS variables + a whisper of 3D, so it stays
 * buttery. Disabled under reduced-motion.
 */
export default function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<Record<string, string>>({});
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    setStyle({ "--gx": `${px}%`, "--gy": `${py}%` });
    setTilt({
      rx: ((e.clientY - r.top) / r.height - 0.5) * -4,
      ry: ((e.clientX - r.left) / r.width - 0.5) * 4,
    });
  };

  const onLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        ...style,
        transform: reduced
          ? undefined
          : `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      {/* the tracking glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--gx,50%) var(--gy,50%), hsl(var(--gold-bright)/0.14), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
