/* ========================================
   Post-processing pipeline orchestrator.
   Exports a helper to register all passes in order.
   ======================================== */

import type { OGLRenderingContext } from 'ogl';
import type { GaldrRenderer } from '../renderer';
import { createBloomPass } from './bloom';
import { createGrainPass } from './grain';
import { createVignettePass } from './vignette';
import { createChromaticPass } from './chromatic';

/** Register all post-processing passes in the correct order. */
export function registerPostPipeline(renderer: GaldrRenderer, gl: OGLRenderingContext): void {
  renderer.addPostPass(createBloomPass(gl));
  renderer.addPostPass(createGrainPass(gl));
  renderer.addPostPass(createVignettePass(gl));
  renderer.addPostPass(createChromaticPass(gl));
}
