import * as THREE from 'three';

// Procedural surfaces for the stone, brick and earth materials. Everything is computed in the
// shader from world-space position, so no texture files are needed and a 1 m block is the same
// size on every model regardless of how its geometry was built. Each kind also adds a bump
// from the same pattern, weathering (grime near the ground, faint rain streaks) and a small
// per-object tint so that repeated pieces don't look cloned.
export const KINDS = { none: 0, masonry: 1, marble: 2, brick: 3, rock: 4, ground: 5, lattice: 6, tiles: 7 };

const COMMON = /* glsl */ `
varying vec3 vSurfPos;
varying vec3 vSurfNormal;
varying float vSurfVar;
float sHash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float sNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(sHash(i), sHash(i + vec3(1, 0, 0)), f.x), mix(sHash(i + vec3(0, 1, 0)), sHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(sHash(i + vec3(0, 0, 1)), sHash(i + vec3(1, 0, 1)), f.x), mix(sHash(i + vec3(0, 1, 1)), sHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float sFbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * sNoise(p); p *= 2.03; a *= 0.5; } return s; }
// Face coordinates: horizontal faces use (x, z); walls use their horizontal axis and height.
vec2 sFaceUV(vec3 p, vec3 n) { vec3 a = abs(n); return a.y > 0.7 ? p.xz : vec2(a.x > a.z ? p.z : p.x, p.y); }
// Running-bond joints for blocks of size s: returns 1 on a joint, 0 on the face of a block.
float sJoints(vec3 p, vec3 n, vec2 s, out vec2 cell) {
  vec2 uv = sFaceUV(p, n) / s;
  float row = floor(uv.y);
  uv.x += 0.5 * mod(row, 2.0);
  cell = floor(uv);
  vec2 f = fract(uv), d = min(f, 1.0 - f) * s;
  return 1.0 - smoothstep(0.012, 0.035, min(d.x, d.y));
}
vec3 sPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection) {
  vec3 vSigmaX = normalize(dFdx(surf_pos)), vSigmaY = normalize(dFdy(surf_pos));
  vec3 R1 = cross(vSigmaY, surf_norm), R2 = cross(surf_norm, vSigmaX);
  float fDet = dot(vSigmaX, R1) * faceDirection;
  vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
  return normalize(abs(fDet) * surf_norm - vGrad);
}
`;

const PATTERN = /* glsl */ `
  vec3 sp = vSurfPos, sn = normalize(vSurfNormal);
  float sFw = length(fwidth(sp));
  float sNear = 1.0 - smoothstep(0.04, 0.16, sFw);
  float sTint = 1.0, sH = 0.0, sRough = 0.0;
  vec2 sCell;
#if SURF_KIND == 1
  float big = sFbm(sp * 0.3), fine = sNoise(sp * 6.0);
  float j = sJoints(sp, sn, vec2(1.2, 0.6), sCell) * sNear;
  sTint = 0.86 + 0.24 * big + 0.08 * (fine - 0.5) + 0.06 * (sHash(vec3(sCell, 3.0)) - 0.5) - 0.2 * j;
  sH = fine * 0.5 + big * 0.3 - j;
#elif SURF_KIND == 2
  float v = sFbm(sp * 0.45);
  float vein = 1.0 - smoothstep(0.0, 0.05, abs(sin(sp.x * 0.7 + sp.y * 0.9 + sp.z * 0.5 + v * 7.0)));
  float j = sJoints(sp, sn, vec2(1.6, 0.8), sCell) * sNear;
  sTint = 0.97 + 0.05 * v - 0.1 * vein * sNear - 0.06 * j;
  sH = -j * 0.6;
  sRough = -0.12;
#elif SURF_KIND == 3
  float j = sJoints(sp, sn, vec2(0.42, 0.12), sCell) * (1.0 - smoothstep(0.015, 0.06, sFw));
  float b = sHash(vec3(sCell, 7.0));
  sTint = mix(0.84 + 0.26 * b + 0.1 * (sFbm(sp * 0.5) - 0.5), 1.3, j);
  sH = -j * 0.8 + sNoise(sp * 10.0) * 0.2;
#elif SURF_KIND == 4
  float big = sFbm(sp * 0.12), fine = sFbm(sp * 1.1);
  sTint = 0.72 + 0.42 * big + 0.16 * (fine - 0.5);
  sH = big * 2.0 + fine;
#elif SURF_KIND == 5
  sTint = 0.84 + 0.3 * sFbm(sp * 0.05) + 0.1 * (sNoise(sp * 2.5) - 0.5);
  sH = sNoise(sp * 3.0) * 0.3;
#elif SURF_KIND == 6
  vec2 c = fract(sFaceUV(sp, sn) / 0.24);
  float hole = step(0.17, min(min(c.x, 1.0 - c.x), min(c.y, 1.0 - c.y))) * (1.0 - smoothstep(0.02, 0.05, sFw));
  sTint = mix(1.0, 0.12, hole);
  sH = -hole;
#elif SURF_KIND == 7
  vec2 q = sFaceUV(sp, sn) / 0.34;
  float d = abs(fract(q.x + q.y) - 0.5) + abs(fract(q.x - q.y) - 0.5);
  float line = (1.0 - smoothstep(0.03, 0.08, abs(d - 0.5))) * (1.0 - smoothstep(0.02, 0.06, sFw));
  sTint = 0.9 + 0.2 * sHash(vec3(floor(q.x + q.y), floor(q.x - q.y), 1.0)) + 0.6 * line;
  sH = line * 0.5;
  sRough = -0.25;
#endif
#if SURF_KIND == 1 || SURF_KIND == 2 || SURF_KIND == 3
  // Weathering: grime near the ground and faint vertical rain streaks on walls
  sTint *= mix(0.8, 1.0, smoothstep(0.0, 5.0, sp.y));
  sTint *= 1.0 - 0.07 * smoothstep(0.55, 0.9, sNoise(vec3(sp.x * 1.3, sp.y * 0.06, sp.z * 1.3))) * (1.0 - abs(sn.y));
#endif
#if SURF_KIND != 5
  sTint *= 0.95 + 0.1 * vSurfVar;
#endif
  diffuseColor.rgb *= sTint;
`;

function patch(shader, kind, bump) {
  shader.defines = { ...(shader.defines || {}), SURF_KIND: kind };
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vSurfPos;\nvarying vec3 vSurfNormal;\nvarying float vSurfVar;')
    .replace('#include <project_vertex>', `#include <project_vertex>
  vec4 sWp = vec4(transformed, 1.0);
  vec3 sWn = objectNormal;
  vec3 sOrigin = modelMatrix[3].xyz;
  #ifdef USE_INSTANCING
    sWp = instanceMatrix * sWp;
    sWn = mat3(instanceMatrix) * sWn;
    sOrigin += instanceMatrix[3].xyz;
  #endif
  sWp = modelMatrix * sWp;
  vSurfPos = sWp.xyz;
  vSurfNormal = normalize(mat3(modelMatrix) * sWn);
  vSurfVar = fract(sin(dot(sOrigin, vec3(12.9898, 78.233, 37.719))) * 43758.5453);`);
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\n' + COMMON)
    .replace('#include <color_fragment>', '#include <color_fragment>\n' + PATTERN)
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor + sRough, 0.05, 1.0);')
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  normal = sPerturb(-vViewPosition, normal, vec2(dFdx(sH), dFdy(sH)) * ${bump.toFixed(2)} * (0.35 + 0.65 * sNear), faceDirection);`);
}

const BUMP = { masonry: 1.2, marble: 0.6, brick: 1.4, rock: 2.2, ground: 0.6, lattice: 1.2, tiles: 0.6 };

// Choose a surface for a material from its look, unless one was set with surface().
function guess(m) {
  if (m.userData.surface) return m.userData.surface;
  if (m.metalness >= 0.35 || m.roughness < 0.3 || m.transparent) return 'none';
  if (m.flatShading) return 'rock';
  const hsl = m.color.getHSL({});
  if (hsl.h > 0.17 && hsl.h < 0.45 && hsl.s > 0.12) return 'ground';
  if (hsl.l > 0.8 && hsl.s < 0.4) return 'marble';
  return 'masonry';
}

// Hook the procedural surface into a MeshStandardMaterial (done for every material made with mat()).
export function attachSurface(m) {
  if (!m.isMeshStandardMaterial) return m;
  m.onBeforeCompile = (shader) => {
    const kind = guess(m);
    if (kind !== 'none') patch(shader, KINDS[kind], BUMP[kind]);
  };
  m.customProgramCacheKey = () => 'surf:' + guess(m);
  return m;
}

// Force a particular surface: 'brick', 'lattice', 'tiles', 'none', etc.
export function surface(m, kind) {
  m.userData.surface = kind;
  return m;
}
