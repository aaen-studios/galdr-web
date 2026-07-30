/* ========================================
   Forge Fire — fullscreen fire shader for the ForgeSection.
   FBM noise distorted upward, classic fire color ramp.
   Activated when the forge section is in viewport.
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { Layer } from '../renderer';
import { state } from '../state';
import { NOISE_GLSL } from '../shaders/noise.glsl';

export function createForgeFireLayer(gl: OGLRenderingContext): Layer {
  let visibility = 0;

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
      uniform float uVisibility;
      uniform vec2 uResolution;

      varying vec2 vUv;

      // Fire color ramp: black → deep red → orange → gold → white
      vec3 fireRamp(float t) {
        t = clamp(t, 0.0, 1.0);
        vec3 c1 = vec3(0.0, 0.0, 0.0);
        vec3 c2 = vec3(0.4, 0.04, 0.0);
        vec3 c3 = vec3(0.8, 0.3, 0.0);
        vec3 c4 = vec3(1.0, 0.65, 0.1);
        vec3 c5 = vec3(1.0, 0.95, 0.7);

        if (t < 0.25) return mix(c1, c2, t / 0.25);
        if (t < 0.5) return mix(c2, c3, (t - 0.25) / 0.25);
        if (t < 0.75) return mix(c3, c4, (t - 0.5) / 0.25);
        return mix(c4, c5, (t - 0.75) / 0.25);
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = uv * vec2(2.0, 3.0);

        // Distort UVs upward for flame shape
        float distortion = fbm(vec3(p.x * 2.0, p.y * 1.5 - uTime * 1.5, uTime * 0.3), 4);
        p.x += distortion * 0.3;
        p.y -= uTime * 2.0; // scroll upward

        // Fire intensity: stronger at bottom, fades up
        float fire = fbm(vec3(p * 1.5, uTime * 0.5), 5);
        fire = fire * 0.5 + 0.5;

        // Shape: narrow at top, wide at bottom
        float shape = smoothstep(1.0, 0.2, uv.y);
        shape *= smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);
        fire *= shape;

        // Threshold for flame tongues
        fire = smoothstep(0.35, 0.7, fire);

        vec3 color = fireRamp(fire);

        // Fade with section visibility
        float alpha = fire * uVisibility * 0.6;

        gl_FragColor = vec4(color * 1.5, alpha); // bright for bloom
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uVisibility: { value: 0 },
      uResolution: { value: [1, 1] },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'forgeFire',

    render(time: number, target: RenderTarget, _clear: boolean) {
      // Smooth visibility transition
      const targetVis = state.sectionVisibility['forge'] ?? 0;
      visibility += (targetVis - visibility) * 0.08;

      if (visibility < 0.01) return;

      program.uniforms.uTime.value = time;
      program.uniforms.uVisibility.value = visibility;
      program.uniforms.uResolution.value = [state.width * state.dpr, state.height * state.dpr];

      // Additive blend for fire glow; never clears
      gl.renderer.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.renderer.render({ scene: mesh, target, clear: false });
    },

    resize(_width: number, _height: number, dpr: number) {
      program.uniforms.uResolution.value = [state.width * dpr, state.height * dpr];
    },

    active: () => (state.sectionVisibility['forge'] ?? 0) > 0.01,

    dispose() {},
  };
}
