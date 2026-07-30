/* ========================================
   Background Layer — volumetric fog + god rays.
   Replaces ScrollBackground.tsx with a fullscreen shader.
   Color ramp driven by scrollTheme.ts stops.
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { Layer } from '../renderer';
import { state } from '../state';
import { NOISE_GLSL } from '../shaders/noise.glsl';
import { UTILS_GLSL } from '../shaders/utils.glsl';
import { SCROLL_STOPS } from '@/lib/scrollTheme';

export function createBackgroundLayer(gl: OGLRenderingContext): Layer {
  // Convert scroll stops to uniform arrays
  const stopPositions = SCROLL_STOPS.map((s) => s.at);
  const stopColors = SCROLL_STOPS.map((s) => [
    s.rgb[0] / 255,
    s.rgb[1] / 255,
    s.rgb[2] / 255,
  ]);

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
      ${UTILS_GLSL}

      uniform float uTime;
      uniform float uScroll;
      uniform float uScrollVelocity;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uStops[5];
      uniform float uStopPositions[5];

      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = (uv - 0.5) * aspect;

        // --- Color ramp from scroll ---
        vec3 baseColor = sampleRamp(uScroll, uStops, uStopPositions);

        // --- Volumetric fog (4-octave FBM) ---
        // Drift slowly upward + sideways, modulated by time
        vec3 fogCoord = vec3(p * 1.8, uTime * 0.03);
        fogCoord.y += uScroll * 2.0; // shift fog field with scroll
        fogCoord.x += uTime * 0.01;

        float fog = fbm(fogCoord, 4);
        fog = fog * 0.5 + 0.5; // remap to [0, 1]

        // Vertical gradient: thicker at bottom (ground mist)
        float groundMist = smoothstep(1.0, 0.0, uv.y) * 0.6 + 0.4;
        fog *= groundMist;

        // --- God rays ---
        // Light source drifts with scroll (top-center → bottom)
        vec2 lightPos = vec2(0.0, 0.7 - uScroll * 0.5);
        lightPos += uMouse * 0.05; // subtle mouse influence
        vec2 rayDir = uv - lightPos;
        float rayDist = length(rayDir);

        // Radial blur sampling toward light
        float rays = 0.0;
        const int SAMPLES = 10;
        float decay = 0.96;
        float weight = 1.0;
        vec2 sampleUv = uv;
        vec2 delta = rayDir / float(SAMPLES) * 0.08;

        for (int i = 0; i < SAMPLES; i++) {
          sampleUv -= delta;
          float s = fbm(vec3(sampleUv * 3.0, uTime * 0.02), 2);
          rays += (s * 0.5 + 0.5) * weight;
          weight *= decay;
        }
        rays /= float(SAMPLES);

        // Attenuate rays by distance from light
        rays *= smoothstep(1.2, 0.0, rayDist) * 0.35;

        // --- Compose ---
        vec3 color = baseColor;

        // Add fog as a subtle brightening
        color += baseColor * fog * 0.4;

        // Add god rays (warm gold tint)
        vec3 rayColor = mix(baseColor, vec3(0.8, 0.65, 0.3), 0.6);
        color += rayColor * rays;

        // Subtle scroll-velocity flash (energy surge)
        float surge = abs(uScrollVelocity) * 0.15;
        color += baseColor * surge;

        // Edge desaturation (atmospheric perspective)
        float edgeFade = smoothstep(0.3, 0.85, length(p));
        color = mix(color, vec3(dot(color, vec3(0.3, 0.6, 0.1))), edgeFade * 0.2);

        // Alpha: fully opaque background
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uScrollVelocity: { value: 0 },
      uResolution: { value: [1, 1] },
      uMouse: { value: [0, 0] },
      uStops: { value: stopColors },
      uStopPositions: { value: stopPositions },
    },
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'background',

    render(time: number, target: RenderTarget, clear: boolean) {
      program.uniforms.uTime.value = time;
      program.uniforms.uScroll.value = state.scroll;
      program.uniforms.uScrollVelocity.value = state.scrollVelocity;
      program.uniforms.uResolution.value = [
        state.width * state.dpr,
        state.height * state.dpr,
      ];
      program.uniforms.uMouse.value = [state.mouseX, state.mouseY];

      // Background is opaque and drawn first — normal blend, clear target
      gl.renderer.setBlendFunc(gl.ONE, gl.ZERO);
      gl.renderer.render({ scene: mesh, target, clear });
    },

    resize(_width: number, _height: number, dpr: number) {
      program.uniforms.uResolution.value = [
        state.width * dpr,
        state.height * dpr,
      ];
    },

    // Background is always active
    active: () => true,

    dispose() {},
  };
}
