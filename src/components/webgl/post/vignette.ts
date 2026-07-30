/* ========================================
   Vignette — smooth radial darkening with warm edge tint.
   Replaces the CSS body::after radial gradient.
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { PostPass } from '../renderer';

export function createVignettePass(gl: OGLRenderingContext): PostPass {
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
      uniform float uIntensity;
      uniform float uSoftness;
      uniform vec3 uTint;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(tMap, vUv);

        // Distance from center (elliptical to match widescreen)
        vec2 center = vUv - 0.5;
        center.x *= 1.1; // slight horizontal stretch
        float dist = length(center);

        // Smooth vignette falloff
        float vignette = 1.0 - smoothstep(0.4, 0.4 + uSoftness, dist);
        vignette = mix(1.0 - uIntensity, 1.0, vignette);

        // Apply vignette with warm tint at edges
        vec3 tinted = color.rgb * mix(uTint, vec3(1.0), vignette);
        color.rgb = tinted * vignette;

        gl_FragColor = color;
      }
    `,
    uniforms: {
      tMap: { value: null },
      uIntensity: { value: 0.55 },
      uSoftness: { value: 0.45 },
      uTint: { value: [0.12, 0.06, 0.02] }, // warm dark edge
    },
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'vignette',

    render(input: RenderTarget, output: RenderTarget | undefined, _time: number) {
      program.uniforms.tMap.value = input.texture;
      gl.renderer.render({ scene: mesh, target: output });
    },

    resize() {},
    dispose() {},
  };
}
