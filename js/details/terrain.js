import * as THREE from 'three';
import { mat, mesh, surface } from '../helpers.js';
import { detail } from '../detail.js';

// Terrain as one heightfield mesh, coloured by height and slope: the shared part for hills,
// ridges, cliffs and mountain ranges, in place of cones and domes.
//
// heightField(w, d, n, fn, opts): a grid w × d (centred on cx, cz) with n cells along its longer
// side, each vertex raised to fn(x, z). Faces are coloured per vertex: where the ground is steep
// (its normal's y below `steep`) the rock colours, in bands by height; where it is gentle, the
// `cover` colour (grass, forest, sand); above `snow` (a height), snow. Flat shaded, so rock reads
// as facets.

// Plain material: the colour comes from the vertices, not from a photo texture.
const TERRAIN = surface(mat('#ffffff', 0.95, 0, { flatShading: true, vertexColors: true }), 'none');

export function heightField(w, d, n, fn, {
  cx = 0, cz = 0, rock = ['#8c7a66', '#9a8670', '#7f7366'], band = 18, cover = '#5b7a43', steep = 0.8,
  snow = Infinity, snowColor = '#f2f4f6', material = TERRAIN,
} = {}) {
  const nx = w >= d ? n : Math.max(2, Math.round((n * w) / d)), nz = w >= d ? Math.max(2, Math.round((n * d) / w)) : n;
  const geo = new THREE.PlaneGeometry(w, d, nx, nz).rotateX(-Math.PI / 2).translate(cx, 0, cz), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, fn(p.getX(k), p.getZ(k)));
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal, col = [], c = new THREE.Color();
  const rocks = rock.map((h) => new THREE.Color(h)), cov = new THREE.Color(cover), sn = new THREE.Color(snowColor);
  for (let k = 0; k < p.count; k++) {
    const y = p.getY(k), x = p.getX(k), z = p.getZ(k), ny = nrm.getY(k), wob = fbm(x, z, { scale: 0.02, octaves: 3 });
    // Rock in strata by height, the bands wavering; scree (rock and cover mixed) on the slopes
    // between rock and level ground; a ragged snow line; and a slight variation over everything,
    // so a slope is never one flat colour.
    const strata = rocks[((Math.floor((y + wob * band * 0.35) / band) % rocks.length) + rocks.length) % rocks.length];
    if (y > snow + 12 * Math.sin(x * 0.05) + 8 * wob && ny > 0.45) c.copy(sn);
    else if (ny < steep) c.copy(strata);
    else if (ny < steep + 0.08) c.copy(strata).lerp(cov, smooth(steep, steep + 0.08, ny));
    else c.copy(cov);
    c.multiplyScalar(1 + 0.07 * fbm(x, z, { scale: 0.05, octaves: 2 }) + 0.04 * wob);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const o = mesh(geo, material);
  o.receiveShadow = true;
  return o;
}

// A little roughness to break up a smooth surface: a sum of sines, about ±1 at amp 1.
export function rough(x, z, amp = 1, s = 1) {
  return amp * (0.5 * Math.sin(x * 0.11 * s + z * 0.07 * s) + 0.3 * Math.sin(x * 0.23 * s - z * 0.19 * s + 1.7) + 0.2 * Math.sin(z * 0.41 * s + x * 0.05 * s + 0.4));
}

// A smooth step from 0 at a to 1 at b.
export function smooth(a, b, t) { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); }

// Value noise: a lattice of repeatable random values, smoothly interpolated (0 to 1).
function hash(i, j) {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// Fractal noise, about -1 to 1: octaves of value noise, each finer and fainter. scale is the
// frequency of the first (1 / its wavelength in metres).
export function fbm(x, z, { scale = 0.01, octaves = 5, gain = 0.5, lacunarity = 2.03 } = {}) {
  let sum = 0, amp = 1, norm = 0, f = scale;
  for (let o = 0; o < octaves; o++) { sum += amp * (noise(x * f + o * 17.3, z * f - o * 9.1) * 2 - 1); norm += amp; amp *= gain; f *= lacunarity; }
  return sum / norm;
}
// Ridged noise, 0 to 1: sharp crests where the noise crosses its middle, as mountain ridges.
export function ridged(x, z, { scale = 0.01, octaves = 4, gain = 0.5, lacunarity = 2.1 } = {}) {
  let sum = 0, amp = 1, norm = 0, f = scale, w = 1;
  for (let o = 0; o < octaves; o++) {
    const r = 1 - Math.abs(noise(x * f + o * 31.7, z * f + o * 11.3) * 2 - 1), q = r * r * w;
    sum += amp * q; norm += amp; w = Math.min(1, q * 2); amp *= gain; f *= lacunarity;
  }
  return sum / norm;
}

// A ring of mountains round a valley: the ground is flat (and below 0) within `inner` of the
// centre, rises steeply to ridges between `inner` and `outer`, and stays high beyond. The ridges
// rise to `h` give or take `vary`: ridged noise for crests, spurs and gullies, the foot of the range
// wandering in and out. aspect stretches the ring along z. Finer on desktops (js/detail.js).
export function mountainRing({ inner = 400, outer = 700, h = 260, vary = 90, size = 2600, n = detail.low ? 120 : 170, aspect = 1, cx = 0, cz = 0, ...opts } = {}) {
  return heightField(size, size, n, (x, z) => {
    const dx = x - cx, dz = (z - cz) / aspect, r = Math.hypot(dx, dz) + 70 * fbm(x, z, { scale: 0.003, octaves: 3 });
    const t = smooth(inner, outer, r);
    const ridge = (h + vary * fbm(x, z, { scale: 0.0022, octaves: 3 })) * (0.62 + 0.55 * ridged(x, z, { scale: 0.0045, octaves: 5 }));
    return t * ridge - 3;
  }, { cx, cz, ...opts });
}
