"use client";

import { useEffect, useRef } from "react";

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const PARTICLE_PALETTE = ["#4f8ef7", "#22c55e", "#a855f7", "#f59e0b", "#ffffff"];
const RING_RADII = [80, 110, 140];
const RING_OPACITIES = [0.6, 0.4, 0.2];
const RING_SPEEDS = [(2 * Math.PI) / 20, -(2 * Math.PI) / 15, (2 * Math.PI) / 25]; // rad/s

type Particle = {
  angle: number;
  speed: number;
  orbitX: number;
  orbitY: number;
  radius: number;
  color: string;
};

function initParticles(count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      angle: Math.random() * 2 * Math.PI,
      speed: 0.002 + Math.random() * 0.004,
      orbitX: 60 + Math.random() * 80,
      orbitY: 50 + Math.random() * 70,
      radius: 2 + Math.random() * 2,
      color: PARTICLE_PALETTE[Math.floor(Math.random() * PARTICLE_PALETTE.length)],
    });
  }
  return out;
}

export default function ShieldHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>(initParticles(20));
  const ringAnglesRef = useRef([0, 0, 0]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const loop = (now: number) => {
      if (!running) return;
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Rings
      for (let i = 0; i < 3; i++) {
        ringAnglesRef.current[i] += RING_SPEEDS[i] * delta;
        const a = ringAnglesRef.current[i];
        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(a);
        ctx.strokeStyle = `rgba(59, 130, 246, ${RING_OPACITIES[i]})`;
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, RING_RADII[i], 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      // Particles
      const particles = particlesRef.current;
      particles.forEach((p) => {
        p.angle += p.speed;
        const x = CENTER + Math.cos(p.angle) * p.orbitX;
        const y = CENTER + Math.sin(p.angle) * p.orbitY;
        const opacity = 0.4 + Math.sin(p.angle * 2) * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, p.radius, 0, 2 * Math.PI);
        const hex = p.color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="relative flex h-[50vh] min-h-[240px] w-full flex-shrink-0 items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
      }}
      aria-hidden
    >
      <div className="relative h-[300px] w-[300px]">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 h-full w-full"
          style={{ display: "block" }}
        />
        <div className="shield-pulse absolute left-1/2 top-1/2 flex h-[120px] w-[100px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <svg
            width="100"
            height="120"
            viewBox="0 0 56 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="shield-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path
              d="M28 0L56 16V32C56 50 44 58 28 64C12 58 0 50 0 32V16L28 0Z"
              fill="url(#shield-gradient)"
            />
            <path
              d="M28 0L56 16V32C56 50 44 58 28 64C12 58 0 50 0 32V16L28 0Z"
              fill="url(#shield-highlight)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
