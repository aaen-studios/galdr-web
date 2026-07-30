'use client';

/* ========================================
   GaldrCanvas — client-side WebGL layer.
   Dynamically imported with ssr: false from page.tsx.
   Renders a fixed canvas behind all page content.
   ======================================== */

import { useEffect, useRef } from 'react';
import { GaldrRenderer } from './renderer';
import { initState, destroyState, state, observeSections } from './state';
import { createBackgroundLayer } from './layers/background';
import { createParticleLayer } from './layers/particles';
import { createConjuringCircleLayer } from './layers/conjuringCircle';
import { createForgeFireLayer } from './layers/forgeFire';
import { createInkDiffusionLayer } from './layers/inkDiffusion';
import { createAlchemyLayer } from './layers/alchemy';
import { createBloomPass } from './post/bloom';
import { createGrainPass } from './post/grain';
import { createVignettePass } from './post/vignette';
import { createChromaticPass } from './post/chromatic';

export default function GaldrCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GaldrRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) {
      // Graceful fallback: canvas stays invisible, CSS effects remain
      canvas.style.display = 'none';
      return;
    }

    initState();

    const renderer = new GaldrRenderer(canvas);
    rendererRef.current = renderer;

    // WebGL is live — suppress the CSS grain/vignette (post-FX replaces them)
    document.body.classList.add('webgl-active');

    // --- Layers (render order = compositing order) ---
    renderer.addLayer(createBackgroundLayer(renderer.gl));
    renderer.addLayer(createParticleLayer(renderer.gl));
    renderer.addLayer(createConjuringCircleLayer(renderer.gl));
    renderer.addLayer(createForgeFireLayer(renderer.gl));
    renderer.addLayer(createInkDiffusionLayer(renderer.gl));
    renderer.addLayer(createAlchemyLayer(renderer.gl));

    // --- Post-processing chain ---
    renderer.addPostPass(createBloomPass(renderer.gl));
    renderer.addPostPass(createGrainPass(renderer.gl));
    renderer.addPostPass(createVignettePass(renderer.gl));
    renderer.addPostPass(createChromaticPass(renderer.gl));

    // --- Section observation ---
    // Wait a tick for DOM to be ready (sections may render after this effect)
    const timer = setTimeout(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-section]')
      );
      if (sections.length > 0) {
        observeSections(sections);
      }
    }, 100);

    // --- Start render loop ---
    renderer.start();

    return () => {
      clearTimeout(timer);
      renderer.dispose();
      destroyState();
      document.body.classList.remove('webgl-active');
      rendererRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
