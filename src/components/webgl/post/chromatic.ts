/* ========================================
   Chromatic Aberration — RGB split proportional to scroll velocity.
   At rest = zero offset. Fast scroll = subtle edge distortion.
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { PostPass } from '../renderer';
import { state } from '../state';

export function createChromaticPass(gl: OGLRenderingContext): PostPass {
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
      uniform float uOffset;
      varying vec2 vUv;

      void main() {
        // Offset increases toward edges (radial)
        vec2 center = vUv - 0.5;
        float dist = length(center);
        vec2 dir = center * dist * uOffset;

        float r = texture2D(tMap, vUv + dir).r;
        float g = texture2D(tMap, vUv).g;
        float b = texture2D(tMap, vUv - dir).b;
        float a = texture2D(tMap, vUv).a;

        gl_FragColor = vec4(r, g, b, a);
      }
    `,
    uniforms: {
      tMap: { value: null },
      uOffset: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'chromatic',

    render(input: RenderTarget, output: RenderTarget | undefined, _time: number) {
      // Map scroll velocity to offset: clamp to subtle range
      const velocity = Math.abs(state.scrollVelocity);
      const offset = Math.min(velocity * 0.008, 0.004);
      program.uniforms.tMap.value = input.texture;
      program.uniforms.uOffset.value = offset;
      gl.renderer.render({ scene: mesh, target: output });
    },

    resize() {},
    dispose() {},
  };
}
