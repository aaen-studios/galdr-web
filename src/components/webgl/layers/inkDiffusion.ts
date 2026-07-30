/* ========================================
   Ink Diffusion — "ink in water" effect for the SubtitlesSection.
   Noise-based turbulent expansion triggered on section entry.
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { Layer } from '../renderer';
import { state } from '../state';
import { NOISE_GLSL } from '../shaders/noise.glsl';

export function createInkDiffusionLayer(gl: OGLRenderingContext): Layer {
  let triggerTime = -10; // time when section entered
  let wasVisible = false;

  const program = new Program(gl, {
    vertex: /* glsl */ `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `,
    fragment: /* glsl */ `
      precision highp float;
      ${NOISE_GLSL}

      uniform float uTime;
      uniform float uTriggerTime;
      uniform vec2 uResolution;

      varying vec2 vUv;

      void main() {
        float elapsed = uTime - uTriggerTime;
        if (elapsed < 0.0 || elapsed > 5.0) {
          gl_FragColor = vec4(0.0);
          return;
        }

        vec2 uv = vUv;
        vec2 center = vec2(0.5, 0.5);
        vec2 p = (uv - center) * vec2(uResolution.x / uResolution.y, 1.0);

        // Expansion radius grows over time
        float radius = elapsed * 0.25;

        // Turbulent edge via noise
        float angle = atan(p.y, p.x);
        float dist = length(p);
        float noise = fbm(vec3(angle * 2.0, dist * 3.0, uTime * 0.3), 4) * 0.15;
        float edge = radius + noise;

        // Ink mask: inside the expansion
        float ink = 1.0 - smoothstep(edge - 0.05, edge + 0.05, dist);

        // Internal turbulence (ink tendrils)
        float tendril = fbm(vec3(p * 4.0, uTime * 0.2 + 10.0), 5);
        tendril = smoothstep(0.0, 0.4, tendril);
        ink *= 0.6 + tendril * 0.4;

        // Fade out after 3 seconds
        float fade = 1.0 - smoothstep(3.0, 5.0, elapsed);
        // Fade in quickly
        float fadeIn = smoothstep(0.0, 0.3, elapsed);

        // Dark ink color (deep blue-black)
        vec3 inkColor = vec3(0.02, 0.03, 0.08);
        float alpha = ink * fade * fadeIn * 0.4;

        gl_FragColor = vec4(inkColor, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uTriggerTime: { value: -10 },
      uResolution: { value: [1, 1] },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'inkDiffusion',

    render(time: number, target: RenderTarget, _clear: boolean) {
      const isVisible = (state.sectionVisibility['subtitles'] ?? 0) > 0.3;

      // Trigger on entry
      if (isVisible && !wasVisible) {
        triggerTime = time;
      }
      wasVisible = isVisible;

      // Don't render if effect has completed
      if (time - triggerTime > 5.0) return;

      program.uniforms.uTime.value = time;
      program.uniforms.uTriggerTime.value = triggerTime;
      program.uniforms.uResolution.value = [state.width * state.dpr, state.height * state.dpr];

      // Standard alpha blend; never clears
      gl.renderer.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.renderer.render({ scene: mesh, target, clear: false });
    },

    resize(_width: number, _height: number, dpr: number) {
      program.uniforms.uResolution.value = [state.width * dpr, state.height * dpr];
    },

    active: () => {
      const isVisible = (state.sectionVisibility['subtitles'] ?? 0) > 0.01;
      return isVisible;
    },

    dispose() {},
  };
}
