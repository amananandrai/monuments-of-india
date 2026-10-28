import * as THREE from 'three';

// Procedural surfaces for the stone, brick and earth materials. Everything is computed in the
// shader from world-space position, so no texture files are needed and a 1 m block is the same
// size on every model regardless of how its geometry was built. Each kind also adds a bump
// from the same pattern, weathering (grime near the ground, faint rain streaks) and a small
// per-object tint so that repeated pieces don't look cloned. Water is its own kind: moving ripples
// that tilt the normal, so the sky reflects in a broken, shifting band instead of a flat sheen.
export const KINDS = { none: 0, masonry: 1, marble: 2, brick: 3, rock: 4, ground: 5, lattice: 6, tiles: 7, foliage: 8, water: 9, script: 10, frieze: 11 };

// Seconds since the page opened, shared by every water material; main.js advances it each frame.
export const waterTime = { value: 0 };
// The colour of the open land (--ground), which the open edges of lawns and water fade into.
export const landColor = { value: new THREE.Color() };

// Photo textures (CC0, Poly Haven) are registered by key and blended in by triplanar projection.
export const PHOTOS = {};
const surfaced = new Set();
export function photoLoaded(key) { surfaced.forEach((m) => { if (m.userData.photoKey === key) m.needsUpdate = true; }); }

const COMMON = /* glsl */ `
varying vec3 vSurfPos;
varying vec3 vSurfNormal;
varying float vSurfVar;
#ifdef SURF_PHOTO
uniform sampler2D sPhoto;
uniform vec3 sPhotoAvg;
uniform float sPhotoScale;
uniform float sPhotoMix;
#endif
float sHash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float sNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(sHash(i), sHash(i + vec3(1, 0, 0)), f.x), mix(sHash(i + vec3(0, 1, 0)), sHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(sHash(i + vec3(0, 0, 1)), sHash(i + vec3(1, 0, 1)), f.x), mix(sHash(i + vec3(0, 1, 1)), sHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float sFbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * sNoise(p); p *= 2.03; a *= 0.5; } return s; }
#ifdef SURF_PATCH
uniform vec4 sPatchB, sPatchF; // footprint (min x, min z, max x, max z); fade margins (min x, max x, min z, max z)
uniform vec3 sLand;
#endif
#if SURF_KIND == 9
uniform float sTime;
uniform vec3 sWave; // wavelength in metres, speed, steepness
// Wave height in metres: four octaves of drifting noise, each turning in a new direction. An octave
// fades out once its wavelength nears a few pixels (fw is metres per pixel), so distant water stays calm.
float sWaterH(vec2 p, float fw) {
  float t = sTime * sWave.y, h = 0.0, a = 1.0, f = 1.0 / sWave.x;
  vec2 dir = vec2(0.8, 0.6);
  for (int i = 0; i < 4; i++) {
    float fade = 1.0 - smoothstep(0.12, 0.35, fw * f);
    h += a * fade * sNoise(vec3(p * f + dir * t * f * sWave.x * 0.25, t * 0.35 + float(i) * 7.1));
    f *= 2.13; a *= 0.48; dir = vec2(-dir.y * 0.9 + dir.x * 0.44, dir.x * 0.9 + dir.y * 0.44);
  }
  return h * sWave.x * sWave.z;
}
#endif
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

// Cuts the lattice holes out, while they are big enough on screen not to shimmer. It runs at the
// clipping stage, before any colour or lighting work. Shadows come from the stone around the
// screen, since the shadow pass draws with its own material.
const JALI_CUT = /* glsl */ `
#if SURF_KIND == 6
  {
    vec2 jc = fract(sFaceUV(vSurfPos, normalize(vSurfNormal)) / 0.22);
    if (length(fwidth(vSurfPos)) < 0.04 && min(min(jc.x, 1.0 - jc.x), min(jc.y, 1.0 - jc.y)) > 0.16) discard;
  }
#endif`;

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
  // Up close the holes are cut out (see JALI_CUT); further away, where they would shimmer, the
  // screen darkens by the share of it that is open.
  vec2 c = fract(sFaceUV(sp, sn) / 0.22);
  float hole = step(0.16, min(min(c.x, 1.0 - c.x), min(c.y, 1.0 - c.y)));
  float sFar = smoothstep(0.04, 0.08, sFw);
  sTint = mix(mix(1.0, 0.55, hole), 0.75, sFar);
  sH = -hole * (1.0 - sFar);
#elif SURF_KIND == 7
  vec2 q = sFaceUV(sp, sn) / 0.34;
  float d = abs(fract(q.x + q.y) - 0.5) + abs(fract(q.x - q.y) - 0.5);
  float line = (1.0 - smoothstep(0.03, 0.08, abs(d - 0.5))) * (1.0 - smoothstep(0.02, 0.06, sFw));
  sTint = 0.9 + 0.2 * sHash(vec3(floor(q.x + q.y), floor(q.x - q.y), 1.0)) + 0.6 * line;
  sH = line * 0.5;
  sRough = -0.25;
#elif SURF_KIND == 8
  float clump = sNoise(sp * 1.6), leaf = sNoise(sp * 7.0);
  sTint = 0.68 + 0.5 * clump + 0.18 * (leaf - 0.5);
  sH = clump * 1.2 + leaf * 0.6;
  sRough = 0.1;
#elif SURF_KIND == 10
  // Incised names: lines of short strokes, 9 cm characters on 14 cm lines. From further off the
  // strokes merge into faint lines of text, then into an even tone.
  vec2 uv = sFaceUV(sp, sn);
  vec2 g = vec2(uv.x / 0.09, uv.y / 0.14), gf = fract(g);
  float word = step(0.18, sHash(vec3(floor(g.x / 6.0), floor(g.y), 5.0)));
  float ink = word * step(0.45, sHash(vec3(floor(g), 3.0))) * step(0.25, gf.x) * step(gf.x, 0.6) * step(0.2, gf.y) * step(gf.y, 0.8);
  float line = word * step(0.2, gf.y) * step(gf.y, 0.8) * 0.45;
  float sMid = smoothstep(0.006, 0.02, sFw), sFar = smoothstep(0.03, 0.08, sFw);
  sTint = mix(mix(mix(1.0, 0.45, ink), mix(1.0, 0.7, line), sMid), 0.9, sFar);
  sH = -ink * 0.4 * (1.0 - sMid);
#elif SURF_KIND == 11
  // A carved band: a row of rosettes on a 42 cm repeat, some left plain so the run is not mechanical.
  vec2 uv = sFaceUV(sp, sn);
  float along = uv.x / 0.42, cell = floor(along);
  float flower = 1.0 - smoothstep(0.05, 0.16, abs(length(vec2(fract(along) - 0.5, fract(uv.y / 0.42) - 0.5)) - 0.22));
  float petal = step(0.28, sHash(vec3(cell, floor(uv.y / 0.42), 4.0)));
  sTint = mix(1.0, 0.68, flower * petal * sNear) * mix(1.0, 0.9, 1.0 - sNear);
  sH = flower * petal;
#elif SURF_KIND == 9
  // Broad patches of slightly darker and lighter water, as wind and depth vary, and wind slicks:
  // rough and glassy streaks a few hundred metres long that break up the sky's reflection.
  float slick = sFbm(vec3(sp.x / 260.0, sp.z / 110.0, sTime * 0.004));
  sTint = (0.9 + 0.2 * sNoise(vec3(sp.xz / (sWave.x * 12.0), sTime * 0.02))) * (0.92 + 0.16 * slick);
  sRough = 0.22 * smoothstep(0.35, 0.7, slick);
#endif
#ifdef SURF_PHOTO
  // Photo detail, projected along each world axis and blended by the surface normal, then
  // divided by the photo's average colour so the model keeps its own colour.
  vec3 sPw = pow(abs(sn), vec3(4.0));
  sPw /= (sPw.x + sPw.y + sPw.z);
  vec3 sPc = texture2D(sPhoto, sp.zy * sPhotoScale).rgb * sPw.x + texture2D(sPhoto, sp.xz * sPhotoScale).rgb * sPw.y + texture2D(sPhoto, sp.xy * sPhotoScale).rgb * sPw.z;
  diffuseColor.rgb *= mix(vec3(1.0), sPc / max(sPhotoAvg, vec3(0.02)), sPhotoMix);
  sH = dot(sPc, vec3(0.333)) * 2.5 + sH * 0.3;
  sTint = mix(sTint, 1.0, 0.7);
#endif
#if SURF_KIND == 1 || SURF_KIND == 2 || SURF_KIND == 3
  // Weathering: grime near the ground and faint vertical rain streaks on walls
  sTint *= mix(0.8, 1.0, smoothstep(0.0, 5.0, sp.y));
  sTint *= 1.0 - 0.07 * smoothstep(0.55, 0.9, sNoise(vec3(sp.x * 1.3, sp.y * 0.06, sp.z * 1.3))) * (1.0 - abs(sn.y));
#endif
#if SURF_KIND != 5 && SURF_KIND != 9
  sTint *= 0.95 + 0.1 * vSurfVar;
#endif
  diffuseColor.rgb *= sTint;
  float sKeep = 1.0;
#ifdef SURF_PATCH
  // Fade into the open land over the margin of each open edge. Noise moves the edge in and out, so
  // it never reads as a straight line, and the land takes the ground disc's own pattern.
  vec4 pe = vec4(sp.x - sPatchB.x, sPatchB.z - sp.x, sp.z - sPatchB.y, sPatchB.w - sp.z);
  vec4 pk = clamp((pe + (sNoise(vec3(sp.xz * 0.04, 3.0)) - 0.5) * sPatchF * 0.9) / max(sPatchF, vec4(1e-3)), 0.0, 1.0);
  pk = mix(vec4(1.0), pk, step(vec4(1e-3), sPatchF));
  sKeep = smoothstep(0.0, 1.0, pk.x * pk.y * pk.z * pk.w);
  diffuseColor.rgb = mix(sLand * (0.84 + 0.3 * sFbm(sp * 0.05) + 0.1 * (sNoise(sp * 2.5) - 0.5)), diffuseColor.rgb, sKeep);
  sH *= sKeep;
  sRough += (1.0 - sKeep) * 0.9;
#endif
`;

// The water normal comes from the wave height's slope in world x and z, so it is right at any
// distance; only upward faces ripple, and a pool's stone sides keep their own normal.
const WATER_NORMAL = /* glsl */ `
  if (sn.y > 0.5) {
    float wFw = max(length(fwidth(sp)), 1e-4), we = sWave.x * 0.04;
    float w0 = sWaterH(sp.xz, wFw);
    vec3 wN = normalize(vec3(-(sWaterH(sp.xz + vec2(we, 0.0), wFw) - w0) / we, 1.0, -(sWaterH(sp.xz + vec2(0.0, we), wFw) - w0) / we));
    wN = normalize(mix(vec3(0.0, 1.0, 0.0), wN, sKeep));
    normal = normalize((viewMatrix * vec4(wN, 0.0)).xyz);
  }`;

function patch(shader, kind, bump, photo, wave, edge) {
  shader.defines = { ...(shader.defines || {}), SURF_KIND: kind };
  if (edge) {
    shader.defines.SURF_PATCH = 1;
    shader.uniforms.sPatchB = { value: new THREE.Vector4(...edge.bounds) };
    shader.uniforms.sPatchF = { value: new THREE.Vector4(...edge.fade) };
    shader.uniforms.sLand = landColor;
  }
  if (kind === KINDS.water) {
    shader.uniforms.sTime = waterTime;
    shader.uniforms.sWave = { value: new THREE.Vector3(...wave) };
  }
  if (photo) {
    shader.defines.SURF_PHOTO = 1;
    shader.uniforms.sPhoto = { value: photo.texture };
    shader.uniforms.sPhotoAvg = { value: photo.avg };
    shader.uniforms.sPhotoScale = { value: photo.scale };
    shader.uniforms.sPhotoMix = { value: photo.mix };
  }
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
    .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + JALI_CUT)
    .replace('#include <color_fragment>', '#include <color_fragment>\n' + PATTERN)
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor + sRough, 0.05, 1.0);')
    .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + (kind === KINDS.water ? WATER_NORMAL
      : `  normal = sPerturb(-vViewPosition, normal, vec2(dFdx(sH), dFdy(sH)) * ${bump.toFixed(2)} * (0.35 + 0.65 * sNear), faceDirection);`));
}

const BUMP = { masonry: 1.2, marble: 0.6, brick: 1.4, rock: 2.2, ground: 0.6, lattice: 0.4, tiles: 0.6, foliage: 1.6, water: 0, script: 0.3, frieze: 0.8 };

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
  surfaced.add(m);
  const photo = () => (m.userData.photoKey && PHOTOS[m.userData.photoKey]) || null;
  m.onBeforeCompile = (shader) => {
    const kind = guess(m);
    if (kind !== 'none') patch(shader, KINDS[kind], BUMP[kind], photo(), m.userData.wave, m.userData.patch);
  };
  m.customProgramCacheKey = () => 'surf:' + guess(m) + (photo() ? ':' + m.userData.photoKey : '') + (m.userData.patch ? ':patch' : '');
  return m;
}

// Force a particular surface: 'brick', 'lattice', 'tiles', 'none', etc.
export function surface(m, kind) {
  m.userData.surface = kind;
  return m;
}
