"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/map/animations";

type Star = { x: number; y: number; z: number; r: number; a: number; speed: number; phase: number; tint: string };

const TINTS = ["255,244,226", "255,236,206", "226,236,255", "255,226,196"];

/** Mulberry32: a tiny seeded generator, so the sky is the same on every visit and on every re-render. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The darkness behind the globe: a warm night sky with a faint nebula and a
 * diagonal band of dust, a few hundred stars on three depth layers that drift
 * and shift slightly with the pointer, and — rarely — a shooting star. All
 * on one 2D canvas. With reduced motion it draws once and stays still.
 */
export function SpaceBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = prefersReducedMotion();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let nebula: HTMLCanvasElement | null = null;
    let raf = 0;
    let pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let shooting: { x: number; y: number; vx: number; vy: number; born: number } | null = null;
    let nextShot = performance.now() + 5000 + Math.random() * 6000;

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const rand = rng(20260);
      const count = Math.min(760, Math.round((w * h) / 2400));
      stars = Array.from({ length: count }, () => {
        const z = rand() < 0.62 ? 0 : rand() < 0.75 ? 1 : 2; // far, middle, near
        return {
          x: rand() * w,
          y: rand() * h,
          z,
          r: (0.35 + rand() * 0.7) * (1 + z * 0.55),
          a: 0.25 + rand() * 0.6,
          speed: 0.4 + rand() * 1.6,
          phase: rand() * Math.PI * 2,
          tint: TINTS[Math.floor(rand() * TINTS.length)],
        };
      });

      // The nebula is expensive to draw and never changes: paint it once, off screen.
      nebula = document.createElement("canvas");
      nebula.width = Math.round(w * dpr);
      nebula.height = Math.round(h * dpr);
      const n = nebula.getContext("2d")!;
      n.scale(dpr, dpr);
      n.fillStyle = "#070605";
      n.fillRect(0, 0, w, h);
      const glow = (x: number, y: number, r: number, color: string) => {
        const g = n.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        n.fillStyle = g;
        n.fillRect(0, 0, w, h);
      };
      glow(w * 0.18, h * 0.22, Math.max(w, h) * 0.55, "rgba(120,72,40,0.22)");
      glow(w * 0.86, h * 0.78, Math.max(w, h) * 0.6, "rgba(38,74,92,0.26)");
      glow(w * 0.55, h * 0.1, Math.max(w, h) * 0.4, "rgba(110,60,84,0.13)");
      // A diagonal band of dust, like the Milky Way seen edge-on.
      n.save();
      n.translate(w * 0.5, h * 0.5);
      n.rotate(-0.42);
      const band = n.createLinearGradient(0, -h * 0.22, 0, h * 0.22);
      band.addColorStop(0, "rgba(255,230,190,0)");
      band.addColorStop(0.5, "rgba(255,226,180,0.085)");
      band.addColorStop(1, "rgba(255,230,190,0)");
      n.fillStyle = band;
      n.fillRect(-w, -h * 0.22, w * 2, h * 0.44);
      n.restore();
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nebula) ctx.drawImage(nebula, 0, 0, w, h);
      smooth.x += (pointer.x - smooth.x) * 0.04;
      smooth.y += (pointer.y - smooth.y) * 0.04;
      const t = now / 1000;
      for (const s of stars) {
        // Nearer stars drift and shift more: parallax from the pointer and a slow sideways glide.
        const k = 4 + s.z * 9;
        const drift = still ? 0 : (t * (0.6 + s.z * 1.1)) % (w + 20);
        let x = s.x - smooth.x * k - drift;
        x = ((x % (w + 20)) + (w + 20)) % (w + 20) - 10;
        const y = s.y - smooth.y * k;
        const twinkle = still ? 1 : 0.65 + 0.35 * Math.sin(t * s.speed + s.phase);
        ctx.fillStyle = `rgba(${s.tint},${(s.a * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.z === 2 && s.r > 1.3) {
          // The brightest few get a soft halo.
          ctx.fillStyle = `rgba(${s.tint},${(0.08 * twinkle).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!still) {
        if (!shooting && now > nextShot) {
          shooting = { x: w * (0.55 + Math.random() * 0.4), y: h * Math.random() * 0.35, vx: -(w * 0.0011 + 0.7), vy: h * 0.00055 + 0.3, born: now };
          nextShot = now + 9000 + Math.random() * 9000;
        }
        if (shooting) {
          const age = now - shooting.born;
          if (age > 900) shooting = null;
          else {
            const px = shooting.x + shooting.vx * age;
            const py = shooting.y + shooting.vy * age;
            const fade = 1 - age / 900;
            const g = ctx.createLinearGradient(px, py, px - shooting.vx * 140, py - shooting.vy * 140);
            g.addColorStop(0, `rgba(255,240,215,${(0.9 * fade).toFixed(3)})`);
            g.addColorStop(1, "rgba(255,240,215,0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - shooting.vx * 140, py - shooting.vy * 140);
            ctx.stroke();
          }
        }
        raf = requestAnimationFrame(draw);
      }
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 };
    };
    const resize = () => {
      build();
      if (still) draw(0);
    };
    build();
    if (still) draw(0);
    else raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
