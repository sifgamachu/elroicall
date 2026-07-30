import { useEffect, useRef } from "react";

/**
 * Cosmos — the gaze of El Roi.
 *
 * A living field of stars in deep heaven. A soft radiance leans toward
 * the visitor's pointer — the sense of a gaze that seeks and finds.
 * Moving stirs a gentle wake; clicking sends a ripple through the
 * heavens, like a prayer touching the throne. Density breathes with
 * scroll — the heavens thicken, then thin toward stillness.
 *
 * Canvas 2D (no WebGL dependency), rAF-throttled, pauses when hidden,
 * and fully disabled under prefers-reduced-motion.
 */
export default function Cosmos() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = { x: number; y: number; z: number; r: number; tw: number; ph: number };
    type Ripple = { x: number; y: number; r: number; a: number };
    let stars: Star[] = [];
    let ripples: Ripple[] = [];

    const pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, energy: 0 };

    const seed = () => {
      const count = Math.min(380, Math.floor((w * h) / 5800));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.3 + Math.random() * 0.7,
        r: 0.4 + Math.random() * 1.5,
        tw: 0.4 + Math.random() * 1.7,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / w;
      const ny = e.clientY / h;
      pointer.energy = Math.min(1, pointer.energy + Math.hypot(nx - pointer.tx, ny - pointer.ty) * 6);
      pointer.tx = nx;
      pointer.ty = ny;
    };

    const onDown = (e: PointerEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 });
      if (ripples.length > 6) ripples.shift();
    };

    let t = 0;
    const frame = () => {
      if (!running) return;
      t += 0.008;
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;
      pointer.energy *= 0.94;

      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, window.scrollY / max);
      const nebula = Math.sin(p * Math.PI);

      ctx.clearRect(0, 0, w, h);

      // dawn sky — warm cream lifting to pale morning blue at the top
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#eef0f2");
      sky.addColorStop(0.4, "#f5efe0");
      sky.addColorStop(1, "#f7f1e4");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // the gaze — a warm sun-glow leaning toward the visitor
      const gx = w * (0.3 + pointer.x * 0.4);
      const gy = h * (0.22 + pointer.y * 0.36);
      const gaze = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.85);
      gaze.addColorStop(0, `rgba(232,180,84,${0.22 + pointer.energy * 0.12})`);
      gaze.addColorStop(0.35, `rgba(224,168,72,${0.1 + pointer.energy * 0.06})`);
      gaze.addColorStop(1, "rgba(224,168,72,0)");
      ctx.fillStyle = gaze;
      ctx.fillRect(0, 0, w, h);

      // drifting light blooms — morning haze catching the sun
      const blooms = 3 + Math.round(nebula * 3);
      for (let i = 0; i < blooms; i++) {
        const bx = w * (0.5 + Math.sin(t * 0.35 + i * 2.1) * 0.32);
        const by = h * (0.42 + Math.cos(t * 0.28 + i * 1.7) * 0.3);
        const br = Math.max(w, h) * (0.2 + 0.11 * Math.sin(t * 0.45 + i));
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const a = 0.1 + nebula * 0.1 + pointer.energy * 0.02;
        bg.addColorStop(0, `rgba(236,196,120,${a})`);
        bg.addColorStop(0.5, `rgba(226,178,100,${a * 0.4})`);
        bg.addColorStop(1, "rgba(226,178,100,0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // light motes — dust of glory drifting in the sunbeam
      for (const s of stars) {
        const px = s.x + (pointer.x - 0.5) * 46 * s.z;
        const py = s.y + (pointer.y - 0.5) * 46 * s.z + t * 6 * s.z;
        const y = ((py % h) + h) % h;
        const tw = 0.5 + 0.5 * Math.sin(t * s.tw * 4 + s.ph);
        const alpha = (0.2 + 0.6 * tw) * s.z * (0.55 + nebula * 0.3 + pointer.energy * 0.2);
        ctx.beginPath();
        ctx.fillStyle = `rgba(178,132,52,${alpha * 0.75})`;
        ctx.arc(px, y, s.r * (0.7 + tw * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // ripples — prayers rippling through morning light
      ripples = ripples.filter((rp) => rp.a > 0.01);
      for (const rp of ripples) {
        rp.r += 3.2;
        rp.a *= 0.965;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(178,132,52,${rp.a * 0.45})`;
        ctx.lineWidth = 1.4;
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(178,132,52,${rp.a * 0.2})`;
        ctx.lineWidth = 1;
        ctx.arc(rp.x, rp.y, rp.r * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full"
    />
  );
}
