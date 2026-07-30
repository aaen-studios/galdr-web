/* Curl noise — divergence-free flow field for particle advection. */

import { NOISE_GLSL } from './noise.glsl';

export const CURL_GLSL = /* glsl */ `
${NOISE_GLSL}

// Curl of a 3D noise field (finite differences).
// Returns a divergence-free velocity vector.
vec3 curlNoise(vec3 p) {
  const float e = 0.1;

  float n1, n2;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  // Partial derivatives via central differences
  n1 = snoise(p + dy);
  n2 = snoise(p - dy);
  float dzdy = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + dz);
  n2 = snoise(p - dz);
  float dydz = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + dz + vec3(31.416, 0.0, 0.0));
  n2 = snoise(p - dz + vec3(31.416, 0.0, 0.0));
  float dxdz = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + dx + vec3(31.416, 0.0, 0.0));
  n2 = snoise(p - dx + vec3(31.416, 0.0, 0.0));
  float dzdx = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + dx + vec3(0.0, 47.123, 0.0));
  n2 = snoise(p - dx + vec3(0.0, 47.123, 0.0));
  float dydx = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + dy + vec3(0.0, 47.123, 0.0));
  n2 = snoise(p - dy + vec3(0.0, 47.123, 0.0));
  float dxdy = (n1 - n2) / (2.0 * e);

  return vec3(
    dzdy - dydz,
    dxdz - dzdx,
    dydx - dxdy
  );
}
`;
