/* ========================================
   Conjuring Circle — 3D hero centerpiece.
   Replaces the SVG ConjuringCircle.tsx with a proper WebGL scene:
   - Gold ring with fresnel glow
   - 24 orbiting Elder Futhark runes (billboard quads, rune atlas)
   - 6 counter-rotating light points
   - Central pulsing sigil
   - Radial energy lines with animated dash
   - Mouse-driven camera orbit + "stir" interaction
   - Click shockwave
   ======================================== */

import {
  Program,
  Mesh,
  Geometry,
  Triangle,
  RenderTarget,
  Texture,
  Camera,
  Transform,
  type OGLRenderingContext,
} from 'ogl';
import type { Layer } from '../renderer';
import { state } from '../state';
import { NOISE_GLSL } from '../shaders/noise.glsl';
import { UTILS_GLSL } from '../shaders/utils.glsl';

const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
const RUNE_COUNT = 24;
const ORB_COUNT = 6;

/** Render Elder Futhark runes to an offscreen canvas → OGL Texture. */
function createRuneAtlas(gl: OGLRenderingContext): Texture {
  const size = 512;
  const cellSize = size / 6; // 6x4 grid = 24 runes
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size * (4 / 6); // 4 rows
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${cellSize * 0.7}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < RUNE_COUNT; i++) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    ctx.fillText(RUNES[i], x, y);
  }

  return new Texture(gl, {
    image: canvas,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
}

export function createConjuringCircleLayer(gl: OGLRenderingContext): Layer {
  const runeAtlas = createRuneAtlas(gl);

  // Interaction state
  let orbitSpeed = 0.3;
  let targetOrbitSpeed = 0.3;
  let glowIntensity = 0.5;
  let targetGlow = 0.5;
  let shockwave = 0;
  let cameraAzimuth = 0;
  let cameraElevation = 0;

  // --- Ring geometry (annulus) ---
  const ringSegments = 128;
  const ringInner = 0.85;
  const ringOuter = 0.95;
  const ringPositions: number[] = [];
  const ringUvs: number[] = [];
  const ringIndices: number[] = [];

  for (let i = 0; i <= ringSegments; i++) {
    const angle = (i / ringSegments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Inner vertex
    ringPositions.push(cos * ringInner, sin * ringInner, 0);
    ringUvs.push(0, i / ringSegments);

    // Outer vertex
    ringPositions.push(cos * ringOuter, sin * ringOuter, 0);
    ringUvs.push(1, i / ringSegments);

    if (i < ringSegments) {
      const base = i * 2;
      ringIndices.push(base, base + 1, base + 2);
      ringIndices.push(base + 1, base + 3, base + 2);
    }
  }

  const ringGeometry = new Geometry(gl, {
    position: { size: 3, data: new Float32Array(ringPositions) },
    uv: { size: 2, data: new Float32Array(ringUvs) },
    index: { data: new Uint16Array(ringIndices) },
  });

  const ringProgram = new Program(gl, {
    vertex: /* glsl */ `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform mat4 uModel;
      uniform float uTime;
      uniform float uShockwave;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Shockwave ripple
        float dist = length(pos.xy);
        pos.z += sin(dist * 20.0 - uTime * 10.0) * uShockwave * 0.05;

        vec4 worldPos = uModel * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize((uModel * vec4(0.0, 0.0, 1.0, 0.0)).xyz);
        gl_Position = uProjection * uView * worldPos;
      }
    `,
    fragment: /* glsl */ `
      precision highp float;
      ${UTILS_GLSL}
      uniform float uTime;
      uniform float uGlow;
      uniform vec3 uCameraPos;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        // Fresnel rim glow
        vec3 viewDir = normalize(uCameraPos - vWorldPos);
        float fresnel = 1.0 - abs(dot(viewDir, vNormal));
        fresnel = pow(fresnel, 3.0);

        // Base gold color
        vec3 gold = vec3(0.79, 0.66, 0.30);
        vec3 hotGold = vec3(1.0, 0.85, 0.4);

        // Animated energy along the ring
        float energy = sin(vUv.y * 6.2831853 * 3.0 - uTime * 2.0) * 0.5 + 0.5;
        energy = pow(energy, 4.0);

        vec3 color = mix(gold, hotGold, energy * uGlow);
        color += hotGold * fresnel * uGlow * 1.5;

        // Brighten for bloom
        color *= 1.0 + uGlow * 0.5;

        float alpha = 0.7 + fresnel * 0.3;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uProjection: { value: null },
      uView: { value: null },
      uModel: { value: null },
      uTime: { value: 0 },
      uGlow: { value: 0.5 },
      uShockwave: { value: 0 },
      uCameraPos: { value: [0, 0, 3] },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
    cullFace: false,
  });

  const ringMesh = new Mesh(gl, { geometry: ringGeometry, program: ringProgram });

  // --- Rune quads (instanced billboards) ---
  // Single quad geometry, instanced via attributes
  const quadPositions = new Float32Array([
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
     0.5,  0.5, 0,
    -0.5,  0.5, 0,
  ]);
  const quadUvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  const quadIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  // Per-instance data: angle offset, rune index
  const instanceAngles = new Float32Array(RUNE_COUNT);
  const instanceRuneIndex = new Float32Array(RUNE_COUNT);
  for (let i = 0; i < RUNE_COUNT; i++) {
    instanceAngles[i] = (i / RUNE_COUNT) * Math.PI * 2;
    instanceRuneIndex[i] = i;
  }

  const runeGeometry = new Geometry(gl, {
    position: { size: 3, data: quadPositions },
    uv: { size: 2, data: quadUvs },
    index: { data: quadIndices },
    aAngle: { size: 1, data: instanceAngles, instanced: 1 },
    aRuneIndex: { size: 1, data: instanceRuneIndex, instanced: 1 },
  });

  const runeProgram = new Program(gl, {
    vertex: /* glsl */ `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      attribute float aAngle;
      attribute float aRuneIndex;

      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform float uTime;
      uniform float uOrbitSpeed;
      uniform float uShockwave;

      varying vec2 vUv;
      varying float vRuneIndex;
      varying float vGlow;

      void main() {
        vRuneIndex = aRuneIndex;

        // Orbit position
        float angle = aAngle + uTime * uOrbitSpeed;
        float radius = 1.1;

        // Shockwave pushes runes outward
        radius += uShockwave * 0.15 * sin(aAngle * 3.0 + uTime * 5.0);

        vec3 orbitPos = vec3(
          cos(angle) * radius,
          sin(angle) * radius,
          0.0
        );

        // Billboard: scale quad and offset to orbit position
        float scale = 0.12;
        vec3 pos = position * scale + orbitPos;

        // Glow based on proximity to "top" (12 o'clock)
        float topProximity = 1.0 - abs(sin(angle)) * 0.5;
        vGlow = topProximity;

        // UV offset into rune atlas (6 columns, 4 rows)
        float col = mod(aRuneIndex, 6.0);
        float row = floor(aRuneIndex / 6.0);
        vUv = (uv + vec2(col, 3.0 - row)) / vec2(6.0, 4.0);

        gl_Position = uProjection * uView * vec4(pos, 1.0);
      }
    `,
    fragment: /* glsl */ `
      precision highp float;
      uniform sampler2D tRuneAtlas;
      uniform float uGlow;
      varying vec2 vUv;
      varying float vRuneIndex;
      varying float vGlow;

      void main() {
        float rune = texture2D(tRuneAtlas, vUv).a;
        if (rune < 0.1) discard;

        // Gold color, brighter when glowing
        vec3 dimGold = vec3(0.5, 0.4, 0.2);
        vec3 brightGold = vec3(1.0, 0.85, 0.4);
        vec3 color = mix(dimGold, brightGold, vGlow * uGlow);

        // Boost for bloom
        color *= 1.0 + vGlow * uGlow;

        gl_FragColor = vec4(color, rune * (0.6 + vGlow * 0.4));
      }
    `,
    uniforms: {
      uProjection: { value: null },
      uView: { value: null },
      uTime: { value: 0 },
      uOrbitSpeed: { value: 0.3 },
      uGlow: { value: 0.5 },
      uShockwave: { value: 0 },
      tRuneAtlas: { value: runeAtlas },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
    cullFace: false,
  });

  const runeMesh = new Mesh(gl, { geometry: runeGeometry, program: runeProgram });

  // --- Central sigil (ᚷ on a quad) ---
  const sigilGeometry = new Geometry(gl, {
    position: { size: 3, data: new Float32Array([-0.3, -0.3, 0, 0.3, -0.3, 0, 0.3, 0.3, 0, -0.3, 0.3, 0]) },
    uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) },
    index: { data: new Uint16Array([0, 1, 2, 0, 2, 3]) },
  });

  const sigilProgram = new Program(gl, {
    vertex: /* glsl */ `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 uProjection;
      uniform mat4 uView;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = uProjection * uView * vec4(position, 1.0);
      }
    `,
    fragment: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform float uGlow;
      varying vec2 vUv;

      // Procedural ᚷ (gebo) glyph — two crossing lines
      float glyph(vec2 uv) {
        vec2 p = uv * 2.0 - 1.0;
        // Two diagonal strokes
        float d1 = abs(p.x + p.y) * 0.7071;
        float d2 = abs(p.x - p.y) * 0.7071;
        float stroke = min(d1, d2);
        return 1.0 - smoothstep(0.06, 0.12, stroke);
      }

      void main() {
        float g = glyph(vUv);
        if (g < 0.01) discard;

        // Pulsing emissive
        float pulse = sin(uTime * 2.0) * 0.3 + 0.7;
        vec3 color = vec3(1.0, 0.8, 0.3) * (pulse + uGlow * 0.5);

        // Radial glow around glyph
        vec2 center = vUv - 0.5;
        float glow = exp(-length(center) * 4.0) * uGlow * 0.3;
        color += vec3(0.8, 0.6, 0.2) * glow;

        gl_FragColor = vec4(color * 2.0, g); // bright for bloom
      }
    `,
    uniforms: {
      uProjection: { value: null },
      uView: { value: null },
      uTime: { value: 0 },
      uGlow: { value: 0.5 },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
    cullFace: false,
  });

  const sigilMesh = new Mesh(gl, { geometry: sigilGeometry, program: sigilProgram });

  // --- Energy lines (radial dashes) ---
  const lineCount = 12;
  const linePositions: number[] = [];
  const lineUvs: number[] = [];
  const lineIndices: number[] = [];

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const inner = 0.3;
    const outer = 0.82;
    const width = 0.008;

    // Perpendicular for width
    const px = -sin * width;
    const py = cos * width;

    const base = i * 4;
    linePositions.push(
      cos * inner + px, sin * inner + py, 0.001,
      cos * inner - px, sin * inner - py, 0.001,
      cos * outer + px, sin * outer + py, 0.001,
      cos * outer - px, sin * outer - py, 0.001,
    );
    lineUvs.push(0, 0, 0, 1, 1, 0, 1, 1);
    lineIndices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }

  const lineGeometry = new Geometry(gl, {
    position: { size: 3, data: new Float32Array(linePositions) },
    uv: { size: 2, data: new Float32Array(lineUvs) },
    index: { data: new Uint16Array(lineIndices) },
  });

  const lineProgram = new Program(gl, {
    vertex: /* glsl */ `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 uProjection;
      uniform mat4 uView;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = uProjection * uView * vec4(position, 1.0);
      }
    `,
    fragment: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform float uGlow;
      varying vec2 vUv;

      void main() {
        // Animated dash pattern marching outward
        float dash = fract(vUv.x * 8.0 - uTime * 1.5);
        dash = smoothstep(0.0, 0.3, dash) * (1.0 - smoothstep(0.5, 0.8, dash));

        // Fade toward outer edge
        float fade = 1.0 - smoothstep(0.5, 1.0, vUv.x);

        float alpha = dash * fade * (0.3 + uGlow * 0.5);
        vec3 color = vec3(0.79, 0.66, 0.30) * (1.0 + uGlow);

        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uProjection: { value: null },
      uView: { value: null },
      uTime: { value: 0 },
      uGlow: { value: 0.5 },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
    cullFace: false,
  });

  const lineMesh = new Mesh(gl, { geometry: lineGeometry, program: lineProgram });

  // --- Camera ---
  const camera = new Camera(gl, {
    fov: 35,
    near: 0.1,
    far: 10,
    aspect: state.width / state.height,
  });
  camera.position.set(0, 0, 3.5);

  // --- Click handler for shockwave ---
  const onClick = () => {
    shockwave = 1.0;
  };
  window.addEventListener('click', onClick);

  return {
    id: 'conjuringCircle',

    render(time: number, target: RenderTarget, _clear: boolean) {
      // --- Interaction smoothing ---
      // Mouse proximity to center → stir
      const mouseDist = Math.sqrt(state.mouseX ** 2 + state.mouseY ** 2);
      const proximity = 1.0 - Math.min(mouseDist / 1.2, 1.0);
      targetOrbitSpeed = 0.3 + proximity * 1.2;
      targetGlow = 0.4 + proximity * 0.6;

      orbitSpeed += (targetOrbitSpeed - orbitSpeed) * 0.05;
      glowIntensity += (targetGlow - glowIntensity) * 0.05;

      // Shockwave decay
      shockwave *= 0.94;
      if (shockwave < 0.001) shockwave = 0;

      // Camera orbit from mouse (±5 degrees)
      const targetAz = state.mouseX * 0.087; // ~5 degrees
      const targetEl = state.mouseY * 0.087;
      cameraAzimuth += (targetAz - cameraAzimuth) * 0.03;
      cameraElevation += (targetEl - cameraElevation) * 0.03;

      camera.position.set(
        Math.sin(cameraAzimuth) * 3.5,
        Math.sin(cameraElevation) * 1.0,
        Math.cos(cameraAzimuth) * 3.5
      );
      camera.lookAt([0, 0, 0]);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();

      const proj = camera.projectionMatrix;
      const view = camera.viewMatrix;

      // --- Visibility: fade with hero section ---
      const heroVisibility = state.sectionVisibility['cover'] ?? 1;
      if (heroVisibility < 0.01) return;

      // Standard alpha blend; never clears (background layer did)
      gl.renderer.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Ring
      ringProgram.uniforms.uProjection.value = proj;
      ringProgram.uniforms.uView.value = view;
      ringProgram.uniforms.uModel.value = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      ringProgram.uniforms.uTime.value = time;
      ringProgram.uniforms.uGlow.value = glowIntensity * heroVisibility;
      ringProgram.uniforms.uShockwave.value = shockwave;
      ringProgram.uniforms.uCameraPos.value = [camera.position.x, camera.position.y, camera.position.z];
      gl.renderer.render({ scene: ringMesh, target, camera, clear: false });

      // Energy lines
      lineProgram.uniforms.uProjection.value = proj;
      lineProgram.uniforms.uView.value = view;
      lineProgram.uniforms.uTime.value = time;
      lineProgram.uniforms.uGlow.value = glowIntensity * heroVisibility;
      gl.renderer.render({ scene: lineMesh, target, camera, clear: false });

      // Runes
      runeProgram.uniforms.uProjection.value = proj;
      runeProgram.uniforms.uView.value = view;
      runeProgram.uniforms.uTime.value = time;
      runeProgram.uniforms.uOrbitSpeed.value = orbitSpeed;
      runeProgram.uniforms.uGlow.value = glowIntensity * heroVisibility;
      runeProgram.uniforms.uShockwave.value = shockwave;
      gl.renderer.render({ scene: runeMesh, target, camera, clear: false });

      // Sigil
      sigilProgram.uniforms.uProjection.value = proj;
      sigilProgram.uniforms.uView.value = view;
      sigilProgram.uniforms.uTime.value = time;
      sigilProgram.uniforms.uGlow.value = glowIntensity * heroVisibility;
      gl.renderer.render({ scene: sigilMesh, target, camera, clear: false });
    },

    resize(width: number, height: number, _dpr: number) {
      camera.perspective({ aspect: width / height });
    },

    // Only active when hero/cover section is visible
    active: () => (state.sectionVisibility['cover'] ?? 1) > 0.01,

    dispose() {
      window.removeEventListener('click', onClick);
    },
  };
}
