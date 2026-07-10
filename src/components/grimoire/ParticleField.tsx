"use client";

import { useEffect, useRef } from "react";
import { lerpColor } from "@/lib/scrollTheme";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function spawnParticle(): Particle {
      return {
        x: Math.random() * (canvas?.width ?? 800),
        y: (canvas?.height ?? 600) + 20,
        size: 1 + Math.random() * 2.5,
        speedY: -(0.15 + Math.random() * 0.35),
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: 0.15 + Math.random() * 0.25,
        life: 0,
        maxLife: 600 + Math.random() * 800,
      };
    }

    // Initial particles
    const initialCount = 20;
    particlesRef.current = Array.from({ length: initialCount }, () => {
      const p = spawnParticle();
      p.y = Math.random() * (canvas?.height ?? 600);
      p.life = Math.random() * p.maxLife;
      return p;
    });

    function animate() {
      if (!running) return;
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Tint the embers with the current scroll color so they rise through
      // the same warm-to-crimson journey as the background glow.
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0;
      const [r, g, b] = lerpColor(progress);

      // Spawn new particles occasionally
      if (Math.random() < 0.02 && particlesRef.current.length < 40) {
        particlesRef.current.push(spawnParticle());
      }

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;

        if (p.life > p.maxLife || p.y < -20 || p.x < -20 || p.x > (canvas.width + 20)) {
          particles[i] = spawnParticle();
          continue;
        }

        const fadeIn = Math.min(1, p.life / 120);
        const fadeOut = Math.max(0, 1 - (p.life - p.maxLife + 200) / 200);
        const alpha = p.opacity * fadeIn * fadeOut;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Subtle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();

    // Pause when tab hidden
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameRef.current);
      } else {
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  );
}
