/* ========================================
   Film Grain — animated hash noise, very subtle.
   Replaces the static SVG feTurbulence overlay (body::before).
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { PostPass } from '../renderer';

export function createGrainPass(gl: OGLRenderingContext): PostPass {
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
      uniform sampler2D tMap;
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;

      // Fast hash for grain
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      void main() {
        vec4 color = texture2D(tMap, vUv);

        // Animated grain — offset by time so it shimmers
        float grain = hash(vUv * 1000.0 + fract(uTime) * 100.0);
        grain = (grain - 0.5) * uIntensity;

        // Apply in overlay-like fashion (subtle on darks, slightly more on mids)
        float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        float mask = smoothstep(0.0, 0.15, luminance) * (1.0 - smoothstep(0.8, 1.0, luminance));
        color.rgb += grain * mask;

        gl_FragColor = color;
      }
    `,
    uniforms: {
      tMap: { value: null },
      uTime: { value: 0 },
      uIntensity: { value: 0.06 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'grain',

    render(input: RenderTarget, output: RenderTarget | undefined, time: number) {
      program.uniforms.tMap.value = input.texture;
      program.uniforms.uTime.value = time;
      gl.renderer.render({ scene: mesh, target: output });
    },

    resize() {},
    dispose() {},
  };
}
