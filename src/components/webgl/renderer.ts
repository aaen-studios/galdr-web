/* ========================================
   OGL Renderer core — manages the GL context, render targets,
   compositing pipeline, and the single RAF loop.

   OGL pattern: `new Renderer()` → `renderer.gl` is the OGLRenderingContext
   (raw WebGL context + `.renderer` back-reference). All OGL objects
   (Program, Mesh, Geometry, etc.) take `gl` as first arg.
   ======================================== */

import { Renderer, Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl';
import { state, updateState, computeDpr } from './state';

export interface Layer {
  /** Unique identifier. */
  id: string;
  /**
   * Render this layer into the shared scene target.
   * @param time   elapsed seconds
   * @param target the shared scene render target all layers composite into
   * @param clear  true only for the first active layer this frame
   */
  render(time: number, target: RenderTarget, clear: boolean): void;
  /** Resize handler. */
  resize(width: number, height: number, dpr: number): void;
  /** Whether this layer should render this frame. */
  active(): boolean;
  /** Cleanup GPU resources. */
  dispose(): void;
}

export interface PostPass {
  id: string;
  render(input: RenderTarget, output: RenderTarget | undefined, time: number): void;
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}

export class GaldrRenderer {
  /** The OGL rendering context (WebGL + .renderer reference). */
  readonly gl: OGLRenderingContext;

  private oglRenderer: Renderer;
  private canvas: HTMLCanvasElement;
  private layers: Layer[] = [];
  private postPasses: PostPass[] = [];

  // Scene compositing targets (ping-pong)
  private sceneTargetA!: RenderTarget;
  private sceneTargetB!: RenderTarget;

  // Final composite program (fullscreen triangle)
  private compositeProgram!: Program;
  private compositeMesh!: Mesh;

  private running = false;
  private rafId: number | null = null;
  private onResizeBound = this.onResize.bind(this);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.oglRenderer = new Renderer({
      canvas,
      dpr: state.dpr,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });

    // In OGL, renderer.gl is the OGLRenderingContext
    this.gl = this.oglRenderer.gl;

    // Size the canvas to the viewport now (constructor doesn't auto-size).
    // OGL's setSize writes pixel values into canvas.style; we override them
    // back to 100% so the fixed-inset-0 layout stays responsive.
    this.oglRenderer.setSize(state.width, state.height);
    this.syncCanvasStyle();

    this.createTargets();
    this.createCompositePass();
    window.addEventListener('resize', this.onResizeBound, { passive: true });
  }

  /** Re-apply responsive CSS after OGL overwrites canvas.style with pixels. */
  private syncCanvasStyle(): void {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
  }

  private createTargets(): void {
    const w = Math.floor(state.width * state.dpr);
    const h = Math.floor(state.height * state.dpr);

    this.sceneTargetA = new RenderTarget(this.gl, {
      width: w,
      height: h,
      depth: false,
    });
    this.sceneTargetB = new RenderTarget(this.gl, {
      width: w,
      height: h,
      depth: false,
    });
  }

  private createCompositePass(): void {
    this.compositeProgram = new Program(this.gl, {
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
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tMap, vUv);
        }
      `,
      uniforms: {
        tMap: { value: null },
      },
      depthTest: false,
      depthWrite: false,
    });

    const geometry = new Triangle(this.gl);
    this.compositeMesh = new Mesh(this.gl, { geometry, program: this.compositeProgram });
  }

  addLayer(layer: Layer): void {
    this.layers.push(layer);
  }

  addPostPass(pass: PostPass): void {
    this.postPasses.push(pass);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.rafId = requestAnimationFrame(this.frame.bind(this));
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private frame(now: number): void {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.frame.bind(this));

    // Skip rendering when tab is hidden
    if (!state.visible) return;

    updateState(now);

    // If reduced motion, render one static frame then stop the loop
    if (state.reducedMotion && state.time > 0.1) {
      this.renderScene();
      this.running = false;
      return;
    }

    this.renderScene();
  }

  private renderScene(): void {
    // --- Render all active layers into the shared scene target ---
    // The first active layer clears the target; the rest composite on top.
    let cleared = false;
    for (const layer of this.layers) {
      if (layer.active()) {
        layer.render(state.time, this.sceneTargetA, !cleared);
        cleared = true;
      }
    }

    // Nothing rendered — clear to transparent so post-FX has clean input
    if (!cleared) {
      this.oglRenderer.render({ scene: this.compositeMesh, target: this.sceneTargetA, clear: true });
    }

    // --- Post-processing chain ---
    if (this.postPasses.length === 0) {
      // No post passes — composite scene directly to screen
      this.compositeProgram.uniforms.tMap.value = this.sceneTargetA.texture;
      this.oglRenderer.render({ scene: this.compositeMesh, clear: true });
      return;
    }

    let input = this.sceneTargetA;
    let output = this.sceneTargetB;

    for (let i = 0; i < this.postPasses.length; i++) {
      const isLast = i === this.postPasses.length - 1;
      this.postPasses[i].render(input, isLast ? undefined : output, state.time);

      if (!isLast) {
        const tmp = input;
        input = output;
        output = tmp;
      }
    }
  }

  private onResize(): void {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = computeDpr();

    // Keep the canvas backing store in sync with the render targets
    this.oglRenderer.dpr = state.dpr;
    this.oglRenderer.setSize(state.width, state.height);
    this.syncCanvasStyle();

    // Resize shared targets in place
    const w = Math.floor(state.width * state.dpr);
    const h = Math.floor(state.height * state.dpr);
    this.sceneTargetA.setSize(w, h);
    this.sceneTargetB.setSize(w, h);

    // Notify layers and post passes
    for (const layer of this.layers) {
      layer.resize(state.width, state.height, state.dpr);
    }
    for (const pass of this.postPasses) {
      pass.resize(state.width, state.height, state.dpr);
    }
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResizeBound);
    for (const layer of this.layers) layer.dispose();
    for (const pass of this.postPasses) pass.dispose();
  }
}
