"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Full-screen touch ripple effect on empty space.
 * Shows a subtle radial "press" wave when the user taps on non-interactive areas.
 * Uses requestAnimationFrame for 120 fps-smooth rendering on a canvas overlay.
 */
export default function TouchRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  type Ripple = {
    x: number;
    y: number;
    startTime: number;
    maxRadius: number;
  };

  const DURATION = 520; // ms total
  const MAX_ALPHA = 0.07; // very subtle

  const isInteractive = (el: EventTarget | null): boolean => {
    if (!el || !(el instanceof HTMLElement)) return false;
    let node: HTMLElement | null = el;
    while (node) {
      const tag = node.tagName;
      if (
        tag === "BUTTON" || tag === "A" || tag === "INPUT" ||
        tag === "TEXTAREA" || tag === "SELECT" || tag === "LABEL"
      ) return true;
      if (
        node.getAttribute("role") === "button" ||
        node.hasAttribute("onclick") ||
        node.classList.contains("device-card") ||
        node.classList.contains("bottom-pill-item") ||
        node.classList.contains("theme-toggle") ||
        node.classList.contains("lang-btn") ||
        node.classList.contains("toggle-track")
      ) return true;
      // data-no-ripple opt-out
      if (node.dataset.noRipple !== undefined) return true;
      node = node.parentElement;
    }
    return false;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    const now = performance.now();
    const alive: Ripple[] = [];

    for (const r of ripplesRef.current) {
      const elapsed = now - r.startTime;
      if (elapsed > DURATION) continue;
      alive.push(r);

      const progress = elapsed / DURATION;
      // ease-out cubic for expansion
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const radius = r.maxRadius * easeOut;

      // alpha: fade in quickly, then fade out
      let alpha: number;
      if (progress < 0.15) {
        alpha = MAX_ALPHA * (progress / 0.15);
      } else {
        alpha = MAX_ALPHA * (1 - (progress - 0.15) / 0.85);
      }

      // Radial gradient: opaque center → transparent edge
      const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius);
      gradient.addColorStop(0, `rgba(128, 128, 128, ${alpha})`);
      gradient.addColorStop(0.6, `rgba(128, 128, 128, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(128, 128, 128, 0)`);

      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ripplesRef.current = alive;

    if (alive.length > 0) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      activeRef.current = false;
    }
  }, []);

  const spawnRipple = useCallback((x: number, y: number) => {
    const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    ripplesRef.current.push({
      x,
      y,
      startTime: performance.now(),
      maxRadius,
    });
    if (!activeRef.current) {
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [draw]);

  useEffect(() => {
    const onTouch = (e: TouchEvent) => {
      if (isInteractive(e.target)) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        spawnRipple(touch.clientX, touch.clientY);
      }
    };

    const onMouse = (e: MouseEvent) => {
      if (isInteractive(e.target)) return;
      spawnRipple(e.clientX, e.clientY);
    };

    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("mousedown", onMouse, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("mousedown", onMouse);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [spawnRipple]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
      aria-hidden="true"
    />
  );
}
