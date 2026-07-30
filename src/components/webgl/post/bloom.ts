/* ========================================
   Bloom — bright-pass extract → gaussian blur → additive composite.
   Runs at half resolution for performance.
   ======================================== */

import { Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import type { PostPass } from '../renderer';
import { state } from '../state';

export function createBloomPass(gl: OGLRenderingContext): PostPass {
  // Half-res targets for blur ping-pong
  let targetA: RenderTarget;
  let targetB: RenderTarget;

  // Bright-pass extraction
  const brightProgram = new Program(gl, {
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
      uniform float uThreshold;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tMap, vUv);
        float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        float contribution = max(brightness - uThreshold, 0.0);
        contribution /= max(brightness, 0.001);
        gl_FragColor = vec4(color.rgb * contribution, color.a);
      }
    `,
    uniforms: {
      tMap: { value: null },
      uThreshold: { value: 0.55 },
    },
    depthTest: false,
    depthWrite: false,
  });

  // Gaussian blur (9-tap, separable)
  const blurProgram = new Program(gl, {
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
      uniform vec2 uDirection;
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
        vec2 texel = uDirection / uResolution;
        vec4 sum = vec4(0.0);
        sum += texture2D(tMap, vUv - 4.0 * texel) * 0.0162;
        sum += texture2D(tMap, vUv - 3.0 * texel) * 0.0540;
        sum += texture2D(tMap, vUv - 2.0 * texel) * 0.1216;
        sum += texture2D(tMap, vUv - 1.0 * texel) * 0.1945;
        sum += texture2D(tMap, vUv) * 0.2270;
        sum += texture2D(tMap, vUv + 1.0 * texel) * 0.1945;
        sum += texture2D(tMap, vUv + 2.0 * texel) * 0.1216;
        sum += texture2D(tMap, vUv + 3.0 * texel) * 0.0540;
        sum += texture2D(tMap, vUv + 4.0 * texel) * 0.0162;
        gl_FragColor = sum;
      }
    `,
    uniforms: {
      tMap: { value: null },
      uDirection: { value: [1, 0] },
      uResolution: { value: [1, 1] },
    },
    depthTest: false,
    depthWrite: false,
  });

  // Composite: original + bloom (additive)
  const compositeProgram = new Program(gl, {
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
      uniform sampler2D tScene;
      uniform sampler2D tBloom;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        vec4 scene = texture2D(tScene, vUv);
        vec4 bloom = texture2D(tBloom, vUv);
        gl_FragColor = scene + bloom * uIntensity;
        gl_FragColor.a = scene.a;
      }
    `,
    uniforms: {
      tScene: { value: null },
      tBloom: { value: null },
      uIntensity: { value: 0.8 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new Triangle(gl);
  const brightMesh = new Mesh(gl, { geometry, program: brightProgram });
  const blurMesh = new Mesh(gl, { geometry, program: blurProgram });
  const compositeMesh = new Mesh(gl, { geometry, program: compositeProgram });

  function createTargets() {
    const w = Math.floor(state.width * state.dpr * 0.5);
    const h = Math.floor(state.height * state.dpr * 0.5);
    const opts = { width: w, height: h, depth: false };
    targetA = new RenderTarget(gl, opts);
    targetB = new RenderTarget(gl, opts);
  }
  createTargets();

  return {
    id: 'bloom',

    render(input: RenderTarget, output: RenderTarget | undefined, _time: number) {
      const w = Math.floor(state.width * state.dpr * 0.5);
      const h = Math.floor(state.height * state.dpr * 0.5);

      // 1. Bright-pass extract → targetA
      brightProgram.uniforms.tMap.value = input.texture;
      gl.renderer.render({ scene: brightMesh, target: targetA });

      // 2. Blur horizontal → targetB
      blurProgram.uniforms.tMap.value = targetA.texture;
      blurProgram.uniforms.uDirection.value = [1, 0];
      blurProgram.uniforms.uResolution.value = [w, h];
      gl.renderer.render({ scene: blurMesh, target: targetB });

      // 3. Blur vertical → targetA
      blurProgram.uniforms.tMap.value = targetB.texture;
      blurProgram.uniforms.uDirection.value = [0, 1];
      gl.renderer.render({ scene: blurMesh, target: targetA });

      // 4. Second blur pass for wider glow
      blurProgram.uniforms.tMap.value = targetA.texture;
      blurProgram.uniforms.uDirection.value = [1, 0];
      gl.renderer.render({ scene: blurMesh, target: targetB });

      blurProgram.uniforms.tMap.value = targetB.texture;
      blurProgram.uniforms.uDirection.value = [0, 1];
      gl.renderer.render({ scene: blurMesh, target: targetA });

      // 5. Composite: scene + bloom → output (or screen)
      compositeProgram.uniforms.tScene.value = input.texture;
      compositeProgram.uniforms.tBloom.value = targetA.texture;
      gl.renderer.render({ scene: compositeMesh, target: output });
    },

    resize() {
      const w = Math.floor(state.width * state.dpr * 0.5);
      const h = Math.floor(state.height * state.dpr * 0.5);
      targetA.setSize(w, h);
      targetB.setSize(w, h);
    },

    dispose() {},
  };
}
