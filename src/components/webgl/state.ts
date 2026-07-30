/* ========================================
   Mutable shared state — read by the render loop, written by DOM listeners.
   Lives entirely outside React to avoid re-renders in the animation frame.
   ======================================== */

export interface GaldrState {
  /** Normalized scroll progress [0, 1]. */
  scroll: number;
  /** Scroll velocity (delta per frame), smoothed. */
  scrollVelocity: number;
  /** Mouse position normalized to [-1, 1]. */
  mouseX: number;
  mouseY: number;
  /** Elapsed time in seconds since init. */
  time: number;
  /** Device pixel ratio (capped). */
  dpr: number;
  /** Viewport dimensions in CSS pixels. */
  width: number;
  height: number;
  /** Currently visible section ID (from IntersectionObserver). */
  activeSection: string;
  /** Per-section visibility [0..1] for smooth transitions. */
  sectionVisibility: Record<string, number>;
  /** Whether the tab is visible. */
  visible: boolean;
  /** Whether reduced motion is preferred. */
  reducedMotion: boolean;
}

export const state: GaldrState = {
  scroll: 0,
  scrollVelocity: 0,
  mouseX: 0,
  mouseY: 0,
  time: 0,
  dpr: 1,
  width: 0,
  height: 0,
  activeSection: 'cover',
  sectionVisibility: {},
  visible: true,
  reducedMotion: false,
};

let lastScroll = 0;
let lastTime = 0;
let rafId: number | null = null;
let observers: IntersectionObserver[] = [];
let listeners: Array<[EventTarget, string, EventListener]> = [];

/** Compute DPR capped at 2 (or 1.5 for very large screens). */
export function computeDpr(): number {
  const raw = window.devicePixelRatio || 1;
  const area = window.innerWidth * window.innerHeight;
  if (area > 1920 * 1080) return Math.min(raw, 1.5);
  return Math.min(raw, 2);
}

/** Update scroll-derived values. Called every frame from the render loop. */
export function updateState(now: number): void {
  const dt = lastTime ? (now - lastTime) / 1000 : 0.016;
  lastTime = now;
  state.time += dt;

  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const current = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  // Smooth velocity (exponential moving average)
  const rawVelocity = (current - lastScroll) / Math.max(dt, 0.001);
  state.scrollVelocity += (rawVelocity - state.scrollVelocity) * 0.1;
  lastScroll = current;
  state.scroll = current;
}

/** Attach all DOM listeners. Call once on mount. */
export function initState(): void {
  state.dpr = computeDpr();
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onResize = () => {
    state.dpr = computeDpr();
    state.width = window.innerWidth;
    state.height = window.innerHeight;
  };

  const onMouseMove = (e: Event) => {
    const me = e as MouseEvent;
    state.mouseX = (me.clientX / state.width) * 2 - 1;
    state.mouseY = -((me.clientY / state.height) * 2 - 1);
  };

  const onVisibility = () => {
    state.visible = !document.hidden;
  };

  const onMotionChange = (e: Event) => {
    state.reducedMotion = (e as MediaQueryListEvent).matches;
  };

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', onMotionChange);

  listeners = [
    [window, 'resize', onResize],
    [window, 'mousemove', onMouseMove],
    [document, 'visibilitychange', onVisibility],
    [motionQuery, 'change', onMotionChange as EventListener],
  ];
}

/** Observe sections for visibility. Pass section elements with data-section ids. */
export function observeSections(elements: HTMLElement[]): void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.getAttribute('data-section') || 'unknown';
        state.sectionVisibility[id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          state.activeSection = id;
        }
      }
    },
    { threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0] }
  );

  for (const el of elements) observer.observe(el);
  observers.push(observer);
}

/** Tear down all listeners and observers. Call on unmount. */
export function destroyState(): void {
  for (const [target, event, fn] of listeners) {
    target.removeEventListener(event, fn);
  }
  for (const obs of observers) obs.disconnect();
  listeners = [];
  observers = [];
  if (rafId !== null) cancelAnimationFrame(rafId);
  lastTime = 0;
  lastScroll = 0;
}
