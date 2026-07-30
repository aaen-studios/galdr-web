/* ========================================
   Particle Layer — GPU-instanced ember particles with curl noise.
   Replaces ParticleField.tsx. Fully GPU-driven lifecycle.
   ======================================== */

import { Program, Mesh, Geometry, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { Layer } from '../renderer';
import { state } from '../state';
import { CURL_GLSL } from '../shaders/curl.glsl';
import { UTILS_GLSL } from '../shaders/utils.glsl';
import { SCROLL_STOPS } from '@/lib/scrollTheme';

const PARTICLE_COUNT = 3000;

export function createParticleLayer(gl: OGLRenderingContext): Layer {
  const stopPositions = SCROLL_STOPS.map((s) => s.at);
  const stopColors = SCROLL_STOPS.map((s) => [
    s.rgb[0] / 255,
    s.rgb[1] / 255,
    s.rgb[2] / 255,
  ]);


  // --- Generate per-particle attributes ---
  // Each particle gets: random seed position, speed, size, phase offset
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT * 4);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread in a cylinder around the viewport
    positions[i * 3] = (Math.random() - 0.5) * 2.5; // x: -1.25..1.25
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5; // y: -1.25..1.25
    positions[i * 3 + 2] = Math.random() * 2.0 - 1.0; // z: depth

    randoms[i * 4] = Math.random(); // speed multiplier
    randoms[i * 4 + 1] = Math.random(); // size
    randoms[i * 4 + 2] = Math.random(); // phase offset
    randoms[i * 4 + 3] = Math.random(); // warmth offset
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    aRandom: { size: 4, data: randoms },
  });

  const program = new Program(gl, {
    vertex: /* glsl */ `
      precision highp float;
      ${CURL_GLSL}

      attribute vec3 position;
      attribute vec4 aRandom;

      uniform float uTime;
      uniform float uScroll;
      uniform float uScrollVelocity;
      uniform vec2 uResolution;
      uniform float uPixelRatio;

      varying float vAlpha;
      varying float vWarmth;
      varying float vSize;

      void main() {
        float speed = mix(0.15, 0.5, aRandom.x);
        float size = mix(1.5, 4.0, aRandom.y);
        float phase = aRandom.z * 6.2831853;
        vWarmth = aRandom.w;

        // Lifecycle: particle rises and loops
        float life = fract(uTime * speed * 0.1 + aRandom.z);

        // Base position
        vec3 pos = position;

        // Curl noise displacement
        vec3 noiseInput = pos * 0.8 + vec3(0.0, uTime * 0.05, uScroll);
        vec3 curl = curlNoise(noiseInput) * 0.3;
        pos += curl;

        // Upward drift (embers rise)
        pos.y += life * 2.5 - 1.25;

        // Scroll influence: swirl when scrolling
        float scrollInfluence = abs(uScrollVelocity) * 2.0;
        pos.x += sin(life * 6.28 + phase) * scrollInfluence * 0.3;
        pos.y += scrollInfluence * 0.2;

        // Fade in/out over lifecycle
        float fadeIn = smoothstep(0.0, 0.1, life);
        float fadeOut = 1.0 - smoothstep(0.7, 1.0, life);
        vAlpha = fadeIn * fadeOut;

        // Depth-based size attenuation
        float depth = (pos.z + 1.0) * 0.5; // 0..1
        float depthScale = mix(0.4, 1.0, depth);
        vAlpha *= depthScale;
        vSize = size * depthScale;

        // Perspective projection (simple orthographic with depth scaling)
        vec2 screenPos = pos.xy;
        screenPos.x *= uResolution.y / uResolution.x; // aspect correction

        gl_Position = vec4(screenPos, pos.z * 0.1, 1.0);
        gl_PointSize = vSize * uPixelRatio;
      }
    `,
    fragment: /* glsl */ `
      precision highp float;
      ${UTILS_GLSL}

      uniform float uScroll;
      uniform vec3 uStops[5];
      uniform float uStopPositions[5];

      varying float vAlpha;
      varying float vWarmth;
      varying float vSize;

      void main() {
        // Soft circular point sprite
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
        alpha *= vAlpha;

        if (alpha < 0.01) discard;

        // Color from scroll ramp + per-particle warmth
        vec3 baseColor = sampleRamp(uScroll, uStops, uStopPositions);
        vec3 warmColor = mix(baseColor, vec3(1.0, 0.7, 0.2), vWarmth * 0.6);

        // Brighten core
        float core = 1.0 - smoothstep(0.0, 0.25, dist);
        vec3 color = mix(warmColor, vec3(1.0, 0.9, 0.6), core * 0.5);

        // Boost brightness for bloom to catch
        color *= 1.5;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uScrollVelocity: { value: 0 },
      uResolution: { value: [1, 1] },
      uPixelRatio: { value: state.dpr },
      uStops: { value: stopColors },
      uStopPositions: { value: stopPositions },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });

  const mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });

  return {
    id: 'particles',

    render(time: number, target: RenderTarget, _clear: boolean) {
      program.uniforms.uTime.value = time;
      program.uniforms.uScroll.value = state.scroll;
      program.uniforms.uScrollVelocity.value = state.scrollVelocity;
      program.uniforms.uResolution.value = [
        state.width * state.dpr,
        state.height * state.dpr,
      ];
      program.uniforms.uPixelRatio.value = state.dpr;

      // Additive blending for glowing embers; never clears (background did)
      gl.renderer.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.renderer.render({ scene: mesh, target, clear: false });
    },

    resize(_width: number, _height: number, dpr: number) {
      program.uniforms.uResolution.value = [
        state.width * dpr,
        state.height * dpr,
      ];
      program.uniforms.uPixelRatio.value = dpr;
    },

    active: () => true,

    dispose() {},
  };
}
