/* Shared GLSL helpers: hashing, color ramp sampling, common constants. */

export const UTILS_GLSL = /* glsl */ `
// --- Hash functions ---
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

// --- Color ramp (5 stops matching scrollTheme.ts) ---
// Stops are passed as a uniform array; this samples them with smooth interpolation.
vec3 sampleRamp(float t, vec3 stops[5], float positions[5]) {
  t = clamp(t, 0.0, 1.0);
  if (t <= positions[0]) return stops[0];
  if (t >= positions[4]) return stops[4];

  for (int i = 0; i < 4; i++) {
    if (t <= positions[i + 1]) {
      float local = (t - positions[i]) / (positions[i + 1] - positions[i]);
      return mix(stops[i], stops[i + 1], local);
    }
  }
  return stops[4];
}

// --- Misc ---
float saturate(float x) { return clamp(x, 0.0, 1.0); }
vec2 saturate(vec2 x) { return clamp(x, vec2(0.0), vec2(1.0)); }

// Smooth pulse: 0 outside [edge0, edge1], smooth peak at center
float pulse(float x, float center, float width) {
  float d = abs(x - center);
  return 1.0 - smoothstep(0.0, width, d);
}
`;
