"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./ConjuringCircle.module.css";

/* ── Geometry (SVG user units; viewBox is 0 0 340 340) ── */
const VIEW = 340;
const CENTER = VIEW / 2; // 170
const OUTER_R = 158; // outermost ring
const RUNE_R = 132; // rune ring baseline
const INNER_R = 108; // inner glow radius
const DOT_R = 92; // orbiting dots
const DOT_COUNT = 6;

/* Runic alphabet placed evenly around the rune ring. Decorative glyphs
   (U+16A0+) render via the system runic fallback — fine here since they're
   not grid-aligned. */
const RUNES = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ",
  "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ",
  "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛝ", "ᛟ", "ᛞ",
];

// Dim parchment -> gold, interpolated by cursor proximity in the draw loop.
const DIM: [number, number, number] = [138, 126, 114]; // --fg-dim  #8a7e72
const GOLD: [number, number, number] = [201, 168, 76]; // --accent  #c9a84c

// Precompute each rune's base angle (starting from top). x/y are recomputed
// every frame in the animation loop; the glyph itself never rotates, so the
// runes stay perfectly horizontal while orbiting.
const RUNE_BASE = RUNES.map((rune, i) => {
  const angle = (i / RUNES.length) * Math.PI * 2 - Math.PI / 2;
  return {
    rune,
    baseAngle: angle,
    x0: Number((CENTER + RUNE_R * Math.cos(angle)).toFixed(4)),
    y0: Number((CENTER + RUNE_R * Math.sin(angle)).toFixed(4)),
  };
});

const DOT_BASE = Array.from({ length: DOT_COUNT }, (_, i) => {
  const angle = (i / DOT_COUNT) * Math.PI * 2;
  return {
    baseAngle: angle,
    x0: Number((CENTER + DOT_R * Math.cos(angle)).toFixed(4)),
    y0: Number((CENTER + DOT_R * Math.sin(angle)).toFixed(4)),
  };
});

// Four cardinal tick marks (just inside the outer ring).
const TICKS = [0, 1, 2, 3].map((i) => {
  const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
  return {
    x1: Number((CENTER + (OUTER_R - 14) * Math.cos(angle)).toFixed(4)),
    y1: Number((CENTER + (OUTER_R - 14) * Math.sin(angle)).toFixed(4)),
    x2: Number((CENTER + OUTER_R * Math.cos(angle)).toFixed(4)),
    y2: Number((CENTER + OUTER_R * Math.sin(angle)).toFixed(4)),
  };
});

export default function ConjuringCircle() {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const runeRefs = useRef<(SVGTextElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const glowRef = useRef<SVGCircleElement>(null);
  const sigilRef = useRef<SVGTextElement>(null);
  const rippleRef = useRef<SVGCircleElement>(null);

  // Mutable animation state (no re-renders).
  const state = useRef({
    rotation: 0, // rune orbit angle (deg)
    dotRotation: 0, // dot orbit angle (deg)
    stir: 0, // eased cursor proximity 0..1
    stirTarget: 0,
    tiltX: 0, // eased 3D tilt (deg)
    tiltY: 0,
    tiltTargetX: 0,
    tiltTargetY: 0,
    flash: 0, // cast flash, decays
    cursor: { x: CENTER, y: CENTER, active: false },
    ripple: { active: false, x: CENTER, y: CENTER, start: 0 },
  });

  useEffect(() => {
    if (reduced) return;
    const svg = svgRef.current;
    if (!svg) return;

    let raf = 0;
    let last = performance.now();

    const ease = (cur: number, target: number, dt: number, rate: number) =>
      cur + (target - cur) * Math.min(1, dt * rate);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp big gaps
      last = now;
      const s = state.current;

      // Ease interactions toward their targets.
      s.stir = ease(s.stir, s.stirTarget, dt, 6);
      s.tiltX = ease(s.tiltX, s.tiltTargetX, dt, 5);
      s.tiltY = ease(s.tiltY, s.tiltTargetY, dt, 5);
      s.flash = Math.max(0, s.flash - dt * 1.8);

      // Orbital rotation — speeds up as the cursor stirs the circle.
      const runeSpeed = 8 + s.stir * 52; // deg/sec
      const dotSpeed = 16 + s.stir * 70;
      s.rotation = (s.rotation + runeSpeed * dt) % 360;
      s.dotRotation = (s.dotRotation - dotSpeed * dt) % 360;

      // ── Runes: orbit but stay horizontal (glyph rotation never changes) ──
      for (let i = 0; i < RUNE_BASE.length; i++) {
        const el = runeRefs.current[i];
        if (!el) continue;
        const a = RUNE_BASE[i].baseAngle + (s.rotation * Math.PI) / 180;
        const x = CENTER + RUNE_R * Math.cos(a);
        const y = CENTER + RUNE_R * Math.sin(a);
        el.setAttribute("x", x.toFixed(2));
        el.setAttribute("y", y.toFixed(2));

        // Brighten toward gold when the cursor is near this rune.
        let prox = 0;
        if (s.cursor.active) {
          const d = Math.hypot(x - s.cursor.x, y - s.cursor.y);
          prox = Math.max(0, 1 - d / 78);
        }
        const r = Math.round(DIM[0] + (GOLD[0] - DIM[0]) * prox);
        const g = Math.round(DIM[1] + (GOLD[1] - DIM[1]) * prox);
        const b = Math.round(DIM[2] + (GOLD[2] - DIM[2]) * prox);
        el.style.fill = `rgb(${r}, ${g}, ${b})`;
        el.style.fillOpacity = (0.5 + prox * 0.5).toFixed(3);
      }

      // ── Orbiting dots ──
      const da = (s.dotRotation * Math.PI) / 180;
      for (let i = 0; i < DOT_BASE.length; i++) {
        const el = dotRefs.current[i];
        if (!el) continue;
        const a = DOT_BASE[i].baseAngle + da;
        el.setAttribute("cx", (CENTER + DOT_R * Math.cos(a)).toFixed(2));
        el.setAttribute("cy", (CENTER + DOT_R * Math.sin(a)).toFixed(2));
      }

      // ── Glow: ambient sine + cursor stir + cast flash ──
      if (glowRef.current) {
        const ambient = 0.1 + 0.05 * Math.sin(now / 850);
        const op = ambient + s.stir * 0.5 + s.flash * 0.55;
        glowRef.current.style.opacity = op.toFixed(3);
      }

      // ── Sigil: scales up with stir / flash ──
      if (sigilRef.current) {
        const scale = 1 + s.stir * 0.08 + s.flash * 0.18;
        sigilRef.current.style.transform = `scale(${scale.toFixed(3)})`;
        sigilRef.current.style.transformOrigin = `${CENTER}px ${CENTER}px`;
      }

      // ── Cast ripple ──
      if (rippleRef.current) {
        const rp = s.ripple;
        if (rp.active) {
          const t = (now - rp.start) / 650;
          if (t >= 1) {
            rp.active = false;
            rippleRef.current.style.opacity = "0";
          } else {
            rippleRef.current.setAttribute("cx", rp.x.toFixed(2));
            rippleRef.current.setAttribute("cy", rp.y.toFixed(2));
            rippleRef.current.setAttribute("r", (t * 95).toFixed(2));
            rippleRef.current.style.opacity = ((1 - t) * 0.55).toFixed(3);
          }
        }
      }

      // ── 3D parallax tilt toward cursor ──
      svg.style.transform = `perspective(900px) rotateX(${s.tiltX.toFixed(2)}deg) rotateY(${s.tiltY.toFixed(2)}deg)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // ── Pointer handlers: stir + tilt; click to cast ──
  const toLocal = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: CENTER, y: CENTER };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW,
      y: ((clientY - rect.top) / rect.height) * VIEW,
    };
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const s = state.current;
    const { x, y } = toLocal(e.clientX, e.clientY);
    s.cursor = { x, y, active: true };
    const dist = Math.hypot(x - CENTER, y - CENTER);
    s.stirTarget = Math.max(0, 1 - dist / CENTER);
    // Tilt toward the cursor (right cursor → rotateY+, down → rotateX-).
    s.tiltTargetX = ((CENTER - y) / CENTER) * 11;
    s.tiltTargetY = ((x - CENTER) / CENTER) * 11;
  };

  const handleLeave = () => {
    const s = state.current;
    s.cursor.active = false;
    s.stirTarget = 0;
    s.tiltTargetX = 0;
    s.tiltTargetY = 0;
  };

  const handleCast = (e: React.PointerEvent<SVGSVGElement>) => {
    const s = state.current;
    const { x, y } = toLocal(e.clientX, e.clientY);
    s.ripple = { active: true, x, y, start: performance.now() };
    s.flash = 1; // sigil + glow flash
    s.stirTarget = Math.min(1, s.stirTarget + 0.3); // a little stir burst
  };

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="presentation"
        aria-hidden="true"
        onPointerMove={reduced ? undefined : handleMove}
        onPointerLeave={reduced ? undefined : handleLeave}
        onPointerDown={reduced ? undefined : handleCast}
      >
        <defs>
          <radialGradient id="cc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cursor-driven glow behind the sigil */}
        <circle
          ref={glowRef}
          cx={CENTER}
          cy={CENTER}
          r={INNER_R}
          fill="url(#cc-glow)"
          style={{ opacity: 0 }}
        />

        {/* Outer ring */}
        <circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="none" stroke="var(--accent-dim)" strokeWidth="1" />
        {/* Inner dashed ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_R}
          fill="none"
          stroke="var(--accent-dim)"
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.7"
        />

        {/* Cardinal tick marks */}
        {TICKS.map((t, i) => (
          <line key={`tick-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--accent)" strokeWidth="1.5" />
        ))}

        {/* Orbiting runes — initial positions set here, updated each frame.
            Glyph orientation is fixed, so they stay horizontal. */}
        {RUNE_BASE.map((p, i) => (
          <text
            key={`rune-${i}`}
            ref={(el) => { runeRefs.current[i] = el; }}
            className={styles.rune}
            x={p.x0}
            y={p.y0}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {p.rune}
          </text>
        ))}

        {/* Orbiting dots */}
        {DOT_BASE.map((p, i) => (
          <circle
            key={`dot-${i}`}
            ref={(el) => { dotRefs.current[i] = el; }}
            cx={p.x0}
            cy={p.y0}
            r="2.5"
            fill="var(--accent)"
            opacity="0.8"
          />
        ))}

        {/* Cast ripple */}
        <circle
          ref={rippleRef}
          className={styles.ripple}
          cx={CENTER}
          cy={CENTER}
          r="0"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          style={{ opacity: 0 }}
        />

        {/* Central sigil — the galdr rune ᚷ */}
        <text
          ref={sigilRef}
          className={styles.sigil}
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="central"
        >
          ᚷ
        </text>
      </svg>
    </div>
  );
}
