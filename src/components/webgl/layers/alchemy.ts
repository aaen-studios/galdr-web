/* ========================================
   Alchemy — molten gold metallic liquid shader for AlchemySection.
   Procedural animated normal map with high specular.
   Reacts to mouse position (ripple from cursor).
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { Layer } from '../renderer';
import { state } from '../state';
import { NOISE_GLSL } from '../shaders/noise.glsl';

export function createAlchemyLayer(gl: OGLRenderingContext): Layer {
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
      uniform vec2 uMouse;
      uniform vec2 uResolution;

      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = uv * aspect;

        // --- Procedural liquid metal ---
        // Multiple layers of noise for organic flow
        float n1 = fbm(vec3(p * 3.0, uTime * 0.15), 4);
        float n2 = fbm(vec3(p * 5.0 + 10.0, uTime * 0.1 + 5.0), 3);
        float n3 = snoise(vec3(p * 8.0, uTime * 0.2));

        // Combine for liquid surface
        float surface = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

        // Compute fake normals from noise gradient
        float eps = 0.01;
        float nx = fbm(vec3((p + vec2(eps, 0.0)) * 3.0, uTime * 0.15), 4) - surface;
        float ny = fbm(vec3((p + vec2(0.0, eps)) * 3.0, uTime * 0.15), 4) - surface;
        vec3 normal = normalize(vec3(-nx / eps * 0.3, -ny / eps * 0.3, 1.0));

        // --- Mouse ripple ---
        vec2 mouseWorld = uMouse * 0.5 + 0.5;
        mouseWorld *= aspect;
        float mouseDist = length(p - mouseWorld);
        float ripple = sin(mouseDist * 30.0 - uTime * 5.0) * exp(-mouseDist * 5.0);
        normal.xy += ripple * 0.3;
        normal = normalize(normal);

        // --- Lighting (specular-heavy for metallic look) ---
        vec3 lightDir = normalize(vec3(0.3, 0.5, 1.0));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);

        float diffuse = max(dot(normal, lightDir), 0.0);
        float specular = pow(max(dot(normal, halfDir), 0.0), 64.0);

        // Gold material
        vec3 goldBase = vec3(0.72, 0.55, 0.15);
        vec3 goldHighlight = vec3(1.0, 0.9, 0.5);

        vec3 color = goldBase * (0.3 + diffuse * 0.5);
        color += goldHighlight * specular * 1.5;

        // Subtle environment reflection (fake)
        vec3 reflectDir = reflect(-viewDir, normal);
        float envReflect = smoothstep(0.0, 1.0, reflectDir.y * 0.5 + 0.5);
        color += goldHighlight * envReflect * 0.2;

        // Fade with section visibility
        float alpha = uVisibility * 0.35;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uVisibility: { value: 0 },
      uMouse: { value: [0, 0] },
      uResolution: { value: [1, 1] },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  return {
    id: 'alchemy',

    render(time: number, target: RenderTarget, _clear: boolean) {
      const targetVis = state.sectionVisibility['alchemy'] ?? 0;
      visibility += (targetVis - visibility) * 0.06;

      if (visibility < 0.01) return;

      program.uniforms.uTime.value = time;
      program.uniforms.uVisibility.value = visibility;
      program.uniforms.uMouse.value = [state.mouseX, state.mouseY];
      program.uniforms.uResolution.value = [state.width * state.dpr, state.height * state.dpr];

      // Standard alpha blend; never clears
      gl.renderer.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.renderer.render({ scene: mesh, target, clear: false });
    },

    resize(_width: number, _height: number, dpr: number) {
      program.uniforms.uResolution.value = [state.width * dpr, state.height * dpr];
    },

    active: () => (state.sectionVisibility['alchemy'] ?? 0) > 0.01,

    dispose() {},
  };
}
